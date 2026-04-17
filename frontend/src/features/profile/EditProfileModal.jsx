import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Label } from "@/components/ui";
import { User, Mail, MapPin, Briefcase, Link as LinkIcon, Calendar, Linkedin, Github, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/axios";
import { toast } from "sonner";
import { branches } from "@/data/branches";

const EditProfileModal = ({ open, onOpenChange, onSuccess }) => {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        currentJobTitle: "",
        currentCompany: "",
        currentLocation: "",
        department: "",
        batch: "",
        socialLinks: {
            linkedin: "",
            github: "",
            website: ""
        }
    });

    useEffect(() => {
        if (auth.alumni) {
            setFormData({
                name: auth.alumni.name || "",
                bio: auth.alumni.bio || "",
                currentJobTitle: auth.alumni.currentJobTitle || "",
                currentCompany: auth.alumni.currentCompany || "",
                currentLocation: auth.alumni.currentLocation || "",
                department: auth.alumni.department || "",
                batch: auth.alumni.batch || "",
                socialLinks: {
                    linkedin: auth.alumni.socialLinks?.linkedin || "",
                    github: auth.alumni.socialLinks?.github || "",
                    website: auth.alumni.socialLinks?.website || ""
                }
            });
        }
    }, [auth.alumni]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform, value) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.put("/alumni/update-profile", formData);
            
            if (response.data.success) {
                toast.success("Profile updated successfully!");
                if (response.data.alumni) {
                    auth.updateAlumni(response.data.alumni);
                }
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white">Edit Intro</DialogTitle>
                    </div>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white overflow-y-auto">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name *</Label>
                                <Input 
                                    id="name" 
                                    value={formData.name} 
                                    onChange={(e) => handleInputChange('name', e.target.value)} 
                                    className="border-slate-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-sm font-semibold text-slate-700">Location</Label>
                                <Input 
                                    id="location" 
                                    value={formData.currentLocation} 
                                    onChange={(e) => handleInputChange('currentLocation', e.target.value)} 
                                    className="border-slate-200"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio</Label>
                            <Textarea 
                                id="bio" 
                                value={formData.bio} 
                                onChange={(e) => handleInputChange('bio', e.target.value)} 
                                className="border-slate-200 min-h-[100px] resize-none"
                                placeholder="Write a brief summary of your professional background..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle" className="text-sm font-semibold text-slate-700">Current Job Title</Label>
                                <Input 
                                    id="jobTitle" 
                                    value={formData.currentJobTitle} 
                                    onChange={(e) => handleInputChange('currentJobTitle', e.target.value)} 
                                    className="border-slate-200"
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company" className="text-sm font-semibold text-slate-700">Current Company</Label>
                                <Input 
                                    id="company" 
                                    value={formData.currentCompany} 
                                    onChange={(e) => handleInputChange('currentCompany', e.target.value)} 
                                    className="border-slate-200"
                                    placeholder="e.g. Google"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-sm font-semibold text-slate-700">Department</Label>
                                <select 
                                    id="department" 
                                    value={formData.department} 
                                    onChange={(e) => handleInputChange('department', e.target.value)} 
                                    className="w-full p-2 border border-slate-200 rounded-md focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Select Dept</option>
                                    {branches.map(branch => (
                                        <option key={branch} value={branch}>{branch}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="batch" className="text-sm font-semibold text-slate-700">Batch (Graduation Year)</Label>
                                <Input 
                                    id="batch" 
                                    value={formData.batch} 
                                    onChange={(e) => handleInputChange('batch', e.target.value)} 
                                    className="border-slate-200"
                                    placeholder="e.g. 2021"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-4">
                            <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Social Profiles</Label>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                        <Linkedin className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <Input 
                                        placeholder="LinkedIn URL"
                                        value={formData.socialLinks.linkedin}
                                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                        className="border-slate-200"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                                        <Github className="w-4 h-4 text-slate-900" />
                                    </div>
                                    <Input 
                                        placeholder="GitHub URL"
                                        value={formData.socialLinks.github}
                                        onChange={(e) => handleSocialChange('github', e.target.value)}
                                        className="border-slate-200"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg shrink-0">
                                        <Globe className="w-4 h-4 text-green-600" />
                                    </div>
                                    <Input 
                                        placeholder="Portfolio Website URL"
                                        value={formData.socialLinks.website}
                                        onChange={(e) => handleSocialChange('website', e.target.value)}
                                        className="border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-white">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-6"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 font-semibold shadow-md shadow-blue-200 transition-all"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;
