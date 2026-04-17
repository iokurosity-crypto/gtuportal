// Frontend Example: Profile Photo Upload Component
// alunet93/src/components/ProfilePhotoUpload.jsx

import { useState } from 'react';
import { uploadImage } from '../utils/cloudinary';
import api from '@/services/axios';
import { useRealTime } from '@/contexts/RealTimeContext';

export function ProfilePhotoUpload({ userId }) {
  const { socket } = useRealTime();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadType, setUploadType] = useState('profile'); // 'profile' or 'cover'

  // ✅ STEP 1: User selects a file
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      console.log(`✅ Selected ${uploadType} photo:`, file.name);
    }
  };

  // ✅ STEP 2: Upload file to Cloudinary
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      console.log(`⏳ Uploading ${uploadType} photo to Cloudinary...`);

      // Direct upload to Cloudinary (no backend involved yet!)
      const cloudinaryUrl = await uploadImage(selectedFile);
      console.log(`✅ Uploaded to Cloudinary! URL:`, cloudinaryUrl);

      // ✅ STEP 3: Send URL to backend to save and broadcast
      await updateProfilePhoto(cloudinaryUrl);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ STEP 3: Save photo URL to database
  const updateProfilePhoto = async (photUrl) => {
    try {
      const endpoint = uploadType === 'profile'
        ? `/profile/${userId}/picture`
        : `/profile/${userId}/cover`;

      const body = uploadType === 'profile'
        ? { profilePicture: photUrl }
        : { coverPhoto: photUrl };

      const response = await api.put(endpoint, body);
      const data = response.data;
      console.log(`✅ ${uploadType} photo saved to database!`);
      console.log('Response:', data);

      // ✅ STEP 4: Listen for Socket.IO event (broadcast from backend)
      if (socket) {
        socket.on(
          uploadType === 'profile' ? 'profile-picture-updated' : 'cover-photo-updated',
          (event) => {
            console.log('🔔 Real-time update received!', event);
            // UI will update automatically
          }
        );
      }

      // Clear form
      setSelectedFile(null);
      setPreviewUrl('');
      alert(`${uploadType} photo updated successfully!`);

    } catch (error) {
      console.error('❌ Failed to save photo:', error);
      alert(`Failed to save photo: ${error.message}`);
    }
  };

  return (
    <div className="profile-photo-upload">
      <h3>Update {uploadType} Photo</h3>

      {/* Type selector */}
      <div className="type-selector">
        <label>
          <input
            type="radio"  
            value="profile"
            checked={uploadType === 'profile'}
            onChange={(e) => {
              setUploadType(e.target.value);
              setPreviewUrl('');
            }}
          />
          Profile Picture
        </label>
        <label>
          <input
            type="radio"
            value="cover"
            checked={uploadType === 'cover'}
            onChange={(e) => {
              setUploadType(e.target.value);
              setPreviewUrl('');
            }}
          />
          Cover Photo
        </label>
      </div>

      {/* File input */}
      <div className="file-input-area">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {selectedFile && (
          <div className="file-info">
            <p>📄 {selectedFile.name}</p>
            <p>📊 {(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="preview">
          <img
            src={previewUrl}
            alt={`${uploadType} preview`}
            style={{
              maxWidth: uploadType === 'profile' ? '150px' : '300px',
              borderRadius: '8px',
              marginTop: '10px'
            }}
          />
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="upload-btn"
      >
        {uploading ? '⏳ Uploading...' : `📤 Upload ${uploadType}`}
      </button>
    </div>
  );
}
