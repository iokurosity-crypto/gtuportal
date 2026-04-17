import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, Briefcase, Award, User, Upload } from "lucide-react";
import api from "@/services/axios";
import { branches } from "@/data/branches";

const CompleteProfileFixed = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(auth.alumni?.profilePhoto || null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.alumni?.name || auth.alumni?.displayName || "",
    graduationYear: auth.alumni?.batch || "",
    department: auth.alumni?.department || "CSE",
    company: auth.alumni?.currentCompany || auth.alumni?.company || "",
    bio: auth.alumni?.bio || "",
    currentJobTitle: auth.alumni?.currentJobTitle || auth.alumni?.title || "",
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photoFile || !auth.alumni?._id) return null;

    try {
      setUploading(true);
      console.log("Starting profile photo upload");
      
      const formDataUpload = new FormData();
      formDataUpload.append('profilePicture', photoFile);

      const response = await api.post('/upload/profile-picture', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Profile photo upload successful:", response.data);
      return response.data.user?.profilePicture || response.data.profilePicture;
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(`Failed to upload photo: ${error.response?.data?.message || error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.alumni) {
      toast.error("Please login first");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.graduationYear) {
      toast.error("Please enter your graduation year");
      return;
    }

    if (!formData.company.trim()) {
      toast.error("Please enter your company");
      return;
    }

    if (!formData.currentJobTitle.trim()) {
      toast.error("Please enter your job title");
      return;
    }

    if (!formData.bio.trim()) {
      toast.error("Please enter your bio");
      return;
    }

    setLoading(true);
    try {
      let profilePicture = auth.alumni?.profilePhoto || "";
      
      // Upload photo if provided
      if (photoFile) {
        try {
          const uploadedPhotoUrl = await uploadPhoto();
          if (uploadedPhotoUrl) {
            profilePicture = uploadedPhotoUrl;
          }
        } catch (photoError) {
          console.warn("Photo upload failed, continuing without photo", photoError);
          toast.warning("Photo could not be uploaded, but will update profile");
        }
      }

      // Update profile via backend API
      const updateData = {
        name: formData.name,
        batch: formData.graduationYear,
        department: formData.department,
        currentCompany: formData.company,
        currentJobTitle: formData.currentJobTitle,
        bio: formData.bio,
        profilePhoto: profilePicture,
      };

      const response = await api.put('/alumni/update-profile', updateData);
      
      if (response.data?.success) {
        console.log("Profile completed successfully");
        toast.success("Profile completed successfully!");
        
        // Refresh user data
        await auth.refreshUser?.();
        
        // Navigate to profile page
        navigate("/profile/me");
      } else {
        toast.error(response.data?.message || "Failed to update profile");
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              Please provide your information to complete your alumni profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 border-4 border-gray-200">
                  <AvatarImage src={photoPreview} />
                  <AvatarFallback className="text-lg">
                    {formData.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </div>
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  
                  {uploading && (
                    <div className="text-sm text-blue-600">
                      Uploading photo...
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                  placeholder="e.g., 2020"
                  min="1950"
                  max="2030"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Current company"
                  required
                />
              </div>

              {/* Achievement/Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio/About Yourself *</Label>
                <Input
                  id="bio"
                  type="text"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="e.g., Software engineer with 5 years of experience"
                  required
                />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="currentJobTitle">Current Job Title *</Label>
                <Input
                  id="currentJobTitle"
                  type="text"
                  value={formData.currentJobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentJobTitle: e.target.value }))}
                  placeholder="e.g., Senior Developer, Product Manager"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || uploading}
                className="w-full"
              >
                {loading ? "Completing Profile..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfileFixed;
