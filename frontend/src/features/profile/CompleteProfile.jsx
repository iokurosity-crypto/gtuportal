import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/services/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button, Input, Label, Textarea, Progress } from "@/components/ui";
import { motion } from "framer-motion";
import { User, Camera, ArrowRight, Linkedin, Github, Globe } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/utils/cloudinary";
import { branches } from "@/data/branches";

const CompleteProfile = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    department: "",
    batch: "",
    currentJobTitle: "",
    currentCompany: "",
    currentLocation: "",
    profilePhoto: "",
    skills: [],
    socialLinks: {
      linkedin: "",
      github: "",
      website: ""
    }
  });

  // Pre-fill form with auth.alumni data on mount
  useEffect(() => {
    console.log('📄 [CompleteProfile] Component mounted');
    console.log('  - auth.alumni:', auth.alumni?.email);
    console.log('  - auth.token:', auth.token ? '✓ present' : '✗ missing');
    
    // Reset form to empty state first
    setFormData({
      name: "",
      bio: "",
      department: "",
      batch: "",
      currentJobTitle: "",
      currentCompany: "",
      currentLocation: "",
      profilePhoto: "",
      skills: [],
      socialLinks: {
        linkedin: "",
        github: "",
        website: ""
      }
    });
    setPreviewUrl(null);
    
    if (auth.alumni) {
      const initialData = {
        name: auth.alumni.name || "",
        bio: auth.alumni.bio || "",
        department: auth.alumni.department || "",
        batch: auth.alumni.batch || "",
        currentJobTitle: auth.alumni.currentJobTitle || "",
        currentCompany: auth.alumni.currentCompany || "",
        currentLocation: auth.alumni.currentLocation || "",
        profilePhoto: auth.alumni.profilePhoto || auth.alumni.profilePicture || "",
        skills: Array.isArray(auth.alumni.skills) ? auth.alumni.skills : [],
        socialLinks: {
          linkedin: auth.alumni.socialLinks?.linkedin || "",
          github: auth.alumni.socialLinks?.github || "",
          website: auth.alumni.socialLinks?.website || ""
        }
      };
      console.log('📝 [CompleteProfile] Pre-filling form:', initialData);
      setFormData(initialData);
      if (initialData.profilePhoto) {
        setPreviewUrl(initialData.profilePhoto);
      }
    }
  }, [auth.alumni?._id]);

  // Calculate profile completion percentage
  useEffect(() => {
    const fields = [
      formData.name,
      formData.bio,
      formData.department,
      formData.batch,
      formData.currentJobTitle,
      formData.currentCompany
    ];
    const filledFields = fields.filter(field => field && field.toString().trim()).length;
    setProgress((filledFields / fields.length) * 100);
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  // Handle profile photo upload to Cloudinary
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be smaller than 5MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        profilePhoto: result.url,
      }));
      setPreviewUrl(result.url);
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('💾 [CompleteProfile] Submitting profile...');
    console.log('  - Data:', {
      name: formData.name,
      bio: formData.bio,
      department: formData.department,
      batch: formData.batch,
      currentJobTitle: formData.currentJobTitle,
      currentCompany: formData.currentCompany,
      profilePhoto: formData.profilePhoto ? '✓ present' : '✗ missing'
    });
    setLoading(true);

    try {
      const response = await api.put("/alumni/update-profile", {
        name: formData.name,
        bio: formData.bio,
        department: formData.department,
        batch: formData.batch,
        profilePhoto: formData.profilePhoto,
        currentJobTitle: formData.currentJobTitle,
        currentCompany: formData.currentCompany,
        currentLocation: formData.currentLocation,
        skills: formData.skills,
        socialLinks: formData.socialLinks
      });

      console.log('✅ [CompleteProfile] Response:', response.data);

      if (response.data.success) {
        console.log('✅ [CompleteProfile] Profile saved successfully');
        toast.success("Profile updated successfully!");
        
        // Update auth context with new alumni data
        if (response.data.alumni) {
          console.log('🔄 [CompleteProfile] Updating auth with:', response.data.alumni);
          auth.updateAlumni(response.data.alumni);
        }
        
        // Redirect to profile page
        setTimeout(() => {
          console.log('🔀 [CompleteProfile] Navigating to /profile/me');
          navigate("/profile/me", { replace: true });
        }, 300);
      } else {
        console.error('❌ [CompleteProfile] Server error:', response.data.message);
        toast.error(response.data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("❌ [CompleteProfile] Error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-lg">
              <div>
                <CardTitle className="text-2xl mb-2">Complete Your Profile</CardTitle>
                <p className="text-teal-100 text-sm">Let's get to know you better! Fill in your details to complete your alumni profile.</p>
              </div>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">Profile Completion</label>
                    <span className="text-xs text-teal-600 font-bold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Profile Photo */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Profile Photo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <label className="flex-1">
                      <div className="flex items-center justify-center w-full px-4 py-2 bg-teal-50 border-2 border-dashed border-teal-300 rounded-lg cursor-pointer hover:border-teal-500 transition">
                        <Camera className="w-5 h-5 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">
                          {uploading ? "Uploading..." : "Choose Photo"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={loading}
                      className="border-slate-300"
                    />
                  </div>

                  {/* Department (Branch) */}
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-semibold">Branch (Department) *</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={loading}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">Select Department</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch (Graduation Year) */}
                  <div className="space-y-2">
                    <Label htmlFor="batch" className="text-sm font-semibold">Batch (Year of Graduation) *</Label>
                    <Input
                      id="batch"
                      type="text"
                      placeholder="e.g., 2020"
                      value={formData.batch}
                      onChange={(e) => handleInputChange('batch', e.target.value)}
                      disabled={loading}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold">Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={loading}
                    className="border-slate-300 min-h-[100px]"
                  />
                </div>

                {/* Career Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Current Job Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Software Engineer"
                      value={formData.currentJobTitle}
                      onChange={(e) => handleInputChange('currentJobTitle', e.target.value)}
                      disabled={loading}
                      className="border-slate-300"
                    />
                  </div>

                  {/* Current Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-semibold">Current Company *</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="e.g., Google, Apple, etc."
                      value={formData.currentCompany}
                      onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                      disabled={loading}
                      className="border-slate-300"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, Country"
                      value={formData.currentLocation}
                      onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                      disabled={loading}
                      className="border-slate-300"
                    />
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-sm font-semibold">Skills</Label>
                    <Input
                      id="skills"
                      type="text"
                      placeholder="e.g., React, Node.js, Python (comma-separated)"
                      value={formData.skills.join(', ')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      disabled={loading}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-sm font-bold text-gray-700">Social Profiles</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                      </div>
                      <Input
                        placeholder="LinkedIn Profile URL"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        disabled={loading}
                        className="border-slate-300"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-slate-100 rounded-md">
                        <Github className="w-4 h-4 text-slate-700" />
                      </div>
                      <Input
                        placeholder="GitHub Profile URL"
                        value={formData.socialLinks.github}
                        onChange={(e) => handleSocialChange('github', e.target.value)}
                        disabled={loading}
                        className="border-slate-300"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-50 rounded-md">
                        <Globe className="w-4 h-4 text-green-600" />
                      </div>
                      <Input
                        placeholder="Portfolio or Personal Website"
                        value={formData.socialLinks.website}
                        onChange={(e) => handleSocialChange('website', e.target.value)}
                        disabled={loading}
                        className="border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Helper Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <strong>Required fields:</strong> Name, Branch, Batch, Bio, Job Title, and Company are required to complete your profile.
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || uploading || progress < 100}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2"
                >
                  {loading ? "Saving..." : "Save & Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CompleteProfile;
