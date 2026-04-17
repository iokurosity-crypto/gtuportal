import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';
import { uploadProfileImage } from '../../../services/imageUploadAPI';
import { toast } from 'sonner';

const PhotoUploadFixed = ({ currentPhoto, onPhotoUpdate, user, refreshUser }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentPhoto || null);
  const [showModal, setShowModal] = useState(false);

  // Update preview when currentPhoto changes (from database)
  useEffect(() => {
    console.log('PhotoUpload currentPhoto updated:', currentPhoto);
    setPreview(currentPhoto);
  }, [currentPhoto]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log('Starting upload for file:', file.name, file.type, file.size);
      const result = await uploadProfileImage(file, setPreview, setProgress, user, refreshUser);
      console.log('Upload successful:', result);
      onPhotoUpdate(result.url);
      setShowModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload photo: ${error.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoUpdate(null);
    setShowModal(false);
  };

  return (
    <>
      {/* Profile Photo */}
      <div className="relative group cursor-pointer" onClick={() => setShowModal(true)}>
        <img
          src={preview || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random`}
          alt={user?.displayName}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Update Profile Photo</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Photo Preview */}
            {preview && (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Current profile"
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-200"
                />
              </div>
            )}

            {/* Upload Options */}
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-gray-600">Choose new photo</span>
              </label>

              {currentPhoto && (
                <button
                  onClick={handleRemovePhoto}
                  className="flex items-center justify-center w-full p-3 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5 mr-2" />
                  Remove current photo
                </button>
              )}
            </div>

            {/* Progress */}
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            {!uploading && preview && preview !== currentPhoto && (
              <div className="mt-4 flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">Photo updated successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoUploadFixed;
