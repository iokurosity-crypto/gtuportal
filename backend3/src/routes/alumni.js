const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/alumni/directory (public)
// Returns all alumni with filters and safe fields only
router.get('/directory', async (req, res) => {
  try {
    const { department, batch, search, page = 1, limit = 30 } = req.query;
    const query = { role: 'alumni' }; // Filter by alumni role
    if (department && department !== 'All') query.department = department;
    if (batch && batch !== 'All') query.batch = batch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('name profilePhoto profilePicture department batch title company isActive _id role bio currentJobTitle currentCompany currentLocation skills socialLinks')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Map User fields to Alumni fields for frontend compatibility
    const alumni = users.map(u => u.toPublicProfile());
    
    res.json({ success: true, alumni });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch directory', error: err.message });
  }
});

// GET /api/alumni/my-profile (protected)
router.get('/my-profile', requireAuth, async (req, res) => {
  try {
    // The requireAuth middleware already attaches the user object to req.user
    return res.status(200).json({ success: true, alumni: req.user.toPublicProfile() });
  } catch (err) {
    console.error('Get my profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/alumni/profile/:id (protected)
router.get('/profile/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Alumni not found' });
    }
    return res.status(200).json({ success: true, alumni: user.toPublicProfile() });
  } catch (err) {
    console.error('Get profile by ID error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/alumni/update-profile (protected)
router.put('/update-profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('💾 [UPDATE-PROFILE] Request for user:', userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ [UPDATE-PROFILE] User not found:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allowedFields = [
      'name', 'phone', 'bio', 'profilePhoto', 'currentJobTitle',
      'currentCompany', 'currentLocation', 'workExperience', 'skills', 'socialLinks',
      'department', 'batch', 'education'
    ];

    console.log('📝 [UPDATE-PROFILE] Updating fields:', Object.keys(req.body).filter(k => allowedFields.includes(k)));

    // Update allowed fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    // After update check: if bio AND currentJobTitle AND currentCompany AND department AND batch are all filled → set isProfileComplete: true
    const requiredFields = {
      bio: !!user.bio,
      currentJobTitle: !!user.currentJobTitle,
      currentCompany: !!user.currentCompany,
      department: !!user.department,
      batch: !!user.batch
    };
    
    const isComplete = Object.values(requiredFields).every(v => v === true);
    user.isProfileComplete = isComplete;

    console.log('📊 [UPDATE-PROFILE] Profile completion check:', { requiredFields, isProfileComplete: isComplete });

    const updatedUser = await user.save();
    console.log('✅ [UPDATE-PROFILE] Profile saved successfully');

    return res.status(200).json({ 
      success: true, 
      alumni: updatedUser.toPublicProfile() 
    });
  } catch (err) {
    console.error('❌ [UPDATE-PROFILE] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/alumni/test-upload (for debugging)
router.get('/test-upload', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ success: true, message: 'Test endpoint works' });
});

/**
 * POST /api/alumni/upload-profile-photo (protected)
 * Upload and update user's profile photo
 * Body: multipart/form-data with 'profilePhoto' field
 */
router.post('/upload-profile-photo', requireAuth, upload.single('profilePhoto'), async (req, res) => {
  let tempFilePath = null;
  try {
    const userId = req.user._id;
    console.log('🖼️ [UPLOAD-PHOTO] User ID:', userId);
    console.log('🖼️ [UPLOAD-PHOTO] File info:', req.file ? { name: req.file.filename, size: req.file.size, path: req.file.path, mimetype: req.file.mimetype } : 'No file');
    console.log('🖼️ [UPLOAD-PHOTO] User object:', { id: req.user._id, email: req.user.email });

    if (!req.file) {
      console.error('❌ [UPLOAD-PHOTO] No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    tempFilePath = req.file.path;

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      console.error('❌ [UPLOAD-PHOTO] User not found:', userId);
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('📤 [UPLOAD-PHOTO] Uploading to Cloudinary...');
    console.log('🔑 [UPLOAD-PHOTO] Cloudinary setup - cloud_name:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
    console.log('🔑 [UPLOAD-PHOTO] Cloudinary setup - api_key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    
    // Upload to Cloudinary
    const uploadResult = await uploadImage(req.file, 'alumni-platform/profile-pictures');
    console.log('✅ [UPLOAD-PHOTO] Cloudinary upload successful:', uploadResult.url);

    // Delete old profile picture from Cloudinary if it exists
    const oldPhotoUrl = currentUser.profilePhoto || currentUser.profilePicture;
    if (oldPhotoUrl && oldPhotoUrl.includes('cloudinary')) {
      try {
        const publicId = oldPhotoUrl.split('/').pop().split('.')[0];
        await deleteImage(`alumni-platform/profile-pictures/${publicId}`);
        console.log('🗑️ [UPLOAD-PHOTO] Old photo deleted from Cloudinary');
      } catch (error) {
        console.log('⚠️ [UPLOAD-PHOTO] Could not delete old profile picture:', error.message);
      }
    }

    // Update user's profile picture in database - set both fields
    console.log('💾 [UPLOAD-PHOTO] Updating database...');
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profilePicture: uploadResult.url, 
        profilePhoto: uploadResult.url 
      },
      { new: true, runValidators: false }
    ).select('-passwordHash');

    console.log('✅ [UPLOAD-PHOTO] Database updated');
    console.log('✅ [UPLOAD-PHOTO] New profilePicture:', updatedUser.profilePicture);
    console.log('✅ [UPLOAD-PHOTO] New profilePhoto:', updatedUser.profilePhoto);

    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.log('⚠️ [UPLOAD-PHOTO] Could not delete temp file');
      }
    }

    // Broadcast to all connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      console.log('📡 [UPLOAD-PHOTO] Broadcasting profile-picture-updated...');
      io.emit('profile-picture-updated', {
        userId: userId.toString(),
        profilePhoto: uploadResult.url,
        profilePicture: uploadResult.url,
        name: updatedUser.name,
        timestamp: new Date()
      });
    } else {
      console.warn('⚠️ [UPLOAD-PHOTO] Socket.IO not available for broadcasting');
    }

    const publicProfile = updatedUser.toPublicProfile();
    console.log('✅ [UPLOAD-PHOTO] Public profile - profilePhoto:', publicProfile.profilePhoto);
    console.log('✅ [UPLOAD-PHOTO] Success - returning response');

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePhotoUrl: uploadResult.url,
      alumni: publicProfile
    });
  } catch (error) {
    console.error('❌ [UPLOAD-PHOTO] Error:', error.message);
    console.error('❌ [UPLOAD-PHOTO] Stack:', error.stack);

    // Clean up temporary file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.log('Could not delete temp file');
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message || 'Unknown error'
    });
  }
});

module.exports = router;
