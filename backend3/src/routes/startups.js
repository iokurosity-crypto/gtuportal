"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Startup_1 = __importDefault(require("../models/Startup"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const ensureDb = (res) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        console.warn('⚠️ [DATABASE] Request received but database is not connected.');
        return true;
    }
    return true;
};
// Public list
router.get('/', async (req, res) => {
    if (!ensureDb(res))
        return;
    const userId = req.query.userId; // Get userId from query parameter
    
    try {
        // Build filter - if userId is provided, filter by ownerId
        const filter = userId ? { ownerId: userId } : {};
        console.log('🚀 [STARTUPS] GET / - userId:', userId, 'filter:', filter);
        
        const startups = await Startup_1.default.find(filter).sort({ createdAt: -1 }).populate('ownerId');
        console.log('🚀 [STARTUPS] Found', startups.length, 'startups');
        res.json({ success: true, startups });
    } catch (error) {
        console.error('Error fetching startups:', error);
        res.status(500).json({ message: 'Failed to fetch startups', success: false });
    }
});

// Get single startup by ID
router.get('/:id', async (req, res) => {
    if (!ensureDb(res))
        return;
    try {
        const startup = await Startup_1.default.findById(req.params.id).populate('ownerId');
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }
        res.json(startup);
    } catch (error) {
        console.error('Error fetching startup:', error);
        res.status(500).json({ message: 'Failed to fetch startup' });
    }
});
// Students and alumni can create startups (UI: students create startups)
router.post('/', authMiddleware_1.requireAuth, (0, authMiddleware_1.requireRole)(['student', 'alumni', 'admin']), async (req, res) => {
    if (!ensureDb(res))
        return;
    try {
        const { 
            title, 
            startupName, 
            tagline, 
            stage, 
            problem, 
            solution,
            keyFeatures,
            targetUsers,
            impact,
            vision,
            supportNeeded,
            attachments,
            coverImage
        } = req.body;
        const normalizedTitle = title || startupName;
        if (!title && !startupName)
            return res.status(400).json({ message: 'title is required' });
        const created = await Startup_1.default.create({
            ownerId: req.user.id,
            title: normalizedTitle,
            ...(tagline ? { tagline } : {}),
            ...(stage ? { stage } : {}),
            ...(problem ? { problem } : {}),
            ...(solution ? { solution } : {}),
            ...(keyFeatures ? { keyFeatures } : {}),
            ...(targetUsers ? { targetUsers } : {}),
            ...(impact ? { impact } : {}),
            ...(vision ? { vision } : {}),
            ...(supportNeeded ? { supportNeeded } : {}),
            ...(attachments && Array.isArray(attachments) && attachments.length ? { attachments } : {}),
            ...(coverImage ? { coverImage } : {}),
        });
        const populated = await Startup_1.default.findById(created._id).populate('ownerId');
        // Broadcast real-time update if socket.io is available
        const io = req.app.get('io');
        if (io) {
            io.emit('new-startup', populated || created);
        }
        return res.status(201).json({ success: true, startup: populated || created });
    } catch (error) {
        console.error('❌ [Startup] Error creating startup:', error);
        return res.status(500).json({ message: 'Failed to create startup', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=startups.js.map