// Cloudinary upload configuration using fetch
import { Cloudinary } from '@cloudinary/url-gen';

// Create a Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz'
  }
});

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB for videos

// Compress image before upload
export const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Reduce dimensions if too large
        if (width > 1920 || height > 1920) {
          const ratio = Math.min(1920 / width, 1920 / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality compression
        canvas.toBlob((blob) => {
          if (blob.size > MAX_IMAGE_SIZE) {
            // If still too large, reduce quality more
            canvas.toBlob((blob2) => {
              resolve(blob2 || blob);
            }, 'image/jpeg', 0.6);
          } else {
            resolve(blob);
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImage = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alumni_uploads';
  
  // Validate file size before upload
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_IMAGE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
      throw new Error(`Image too large (${sizeMB}MB). Maximum is ${maxMB}MB. Compressing...`);
    }
  } else if (file.type.startsWith('video/')) {
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(0);
      throw new Error(`Video too large (${sizeMB}MB). Maximum is ${maxMB}MB.`);
    }
  }
  
  console.log('Upload config:', { cloudName, uploadPreset, fileSize: (file.size / (1024 * 1024)).toFixed(2) + 'MB' });
  
  // Compress image if needed
  let fileToUpload = file;
  if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
    console.log('Compressing image...');
    fileToUpload = await compressImage(file);
  }
  
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'alumni-platform/profiles');

  // Determine upload endpoint based on file type
  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo ? 'video/upload' : 'image/upload';

  try {
    console.log(`Starting ${isVideo ? 'video' : 'image'} upload to Cloudinary...`);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`,
      {
        method: 'POST',
        body: formData
      }
    );

    console.log(`Upload response status for ${isVideo ? 'video' : 'image'}:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Upload failed for ${isVideo ? 'video' : 'image'}:`, errorData);
      
      // Provide more specific error messages
      if (errorData.error?.message?.includes('Upload preset')) {
        throw new Error('Upload preset not found. Please check Cloudinary configuration.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Check API credentials.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Check upload permissions.');
      } else if (response.status === 404) {
        throw new Error('Cloud name not found or upload preset missing.');
      } else if (response.status === 413 || response.status === 400) {
        throw new Error(`File ${isVideo ? 'video' : 'image'} is too large. Max ${isVideo ? '25MB for videos' : '5MB for images'}.`);
      } else {
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    console.log(`${isVideo ? 'Video' : 'Image'} upload successful:`, data);
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error(`Error uploading ${isVideo ? 'video' : 'image'}:`, error);
    throw new Error(error.message || `Failed to upload ${isVideo ? 'video' : 'image'}`);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alumni_uploads'
        })
      }
    );

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

// Get optimized image URL
export const getOptimizedUrl = (publicId, options = {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
    ...options
  };

  const params = new URLSearchParams(defaultOptions).toString();
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}`;
};

// Get transformed image URL (crop, resize, etc.)
export const getTransformedUrl = (publicId, options = {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dv0heb3cz';
  const defaultOptions = {
    crop: 'auto',
    gravity: 'auto',
    width: 500,
    height: 500,
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
    ...options
  };

  const params = new URLSearchParams(defaultOptions).toString();
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}`;
};
