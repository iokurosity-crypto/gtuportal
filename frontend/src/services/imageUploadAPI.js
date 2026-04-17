import { uploadImage } from "../utils/cloudinary";
import { uploadAsDataURL } from "../utils/dataURLUpload";
import { toast } from "sonner";
import api from "./axios";

// Compatibility export used by some components
export const uploadImageToCloudinary = async (file) => {
    return uploadImage(file);
};

// Upload post image using Data URL (always works)
export const uploadPostImage = async (file, setPostImage, setProgress) => {
    try {
        console.log('uploadPostImage called with file:', file?.name);
        setProgress(10);
        
        // Use Data URL directly - always works
        const result = await uploadAsDataURL(file);
        console.log('Data URL upload successful:', result);
        
        setProgress(50);
        
        // Only call setPostImage if it's a function
        if (typeof setPostImage === 'function') {
            setPostImage(result.url);
        }
        
        setProgress(100);
        
        toast.success("Image uploaded successfully!");
        return result;
    } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image. Please try again.");
        setProgress(0);
        throw error;
    }
};

// Upload profile picture using Data URL only (bypasses CORS issues)
export const uploadProfileImage = async (file, setProfileImage, setProgress, user, refreshUser) => {
    try {
        console.log('uploadProfileImage called with file:', file?.name);
        setProgress(10);
        
        // Use Data URL directly - always works, no CORS issues
        const result = await uploadAsDataURL(file);
        console.log('Data URL upload successful:', result);
        
        setProgress(50);
        
        // Only call setProfileImage if it's a function
        if (typeof setProfileImage === 'function') {
            setProfileImage(result.url);
        }

        // Update profile photo via API (MongoDB backend)
        if (user && (user._id || user.id || user.uid)) {
            try {
                const userId = user._id || user.id || user.uid;
                await api.put(`/profile/${userId}/picture`, {
                    profilePicture: result.url,
                });
                console.log('Profile photo updated in database');
            } catch (apiError) {
                console.warn('Failed to update photo in database:', apiError);
            }
        }

        if (refreshUser) {
            await refreshUser();
        }
        
        setProgress(100);
        
        toast.success("Profile picture updated!");
        return result;
    } catch (error) {
        console.error("Profile upload error:", error);
        toast.error(`Failed to upload profile picture: ${error.message || 'Please try again.'}`);
        setProgress(0);
        throw error;
    }
};

// Upload event cover image using Cloudinary
export const uploadEventImage = async (file, setEventImage, setProgress) => {
    try {
        setProgress(10);
        
        const result = await uploadImage(file);
        setProgress(50);
        
        setEventImage(result.url);
        setProgress(100);
        
        toast.success("Event image uploaded!");
        return result;
    } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload event image. Please try again.");
        setProgress(0);
        throw error;
    }
};
