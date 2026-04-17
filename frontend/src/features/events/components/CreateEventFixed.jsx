import React, { useState } from 'react';
import { X, Calendar, MapPin, Video, Upload, Hash, Clock, Link as LinkIcon, AtSign, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '@/services/imageUploadAPI.js';
import { uploadImage } from '@/utils/cloudinary';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CreateEventFixed = ({ onEventCreate, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    startDate: '',
    startTime: '',
    mode: 'offline',
    location: '',
    meetingLink: '',
    registrationLink: '',
    contactInfo: '',
    tags: '',
    organizer: user?.displayName || '',
    organizerEmail: user?.email || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      console.log('📸 [CreateEvent] Uploading image:', file.name, 'Size:', file.size);
      const result = await uploadImage(file);
      console.log('✅ [CreateEvent] Image uploaded successfully:', result);
      setCoverImageUrl(result.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error("❌ [CreateEvent] Image upload failed:", err);
      toast.error(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      await handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setCoverImageUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process hashtags/keywords (allow # prefix and comma separation)
      const tags = formData.tags
        .split(/[, ]+/)
        .map(tag => tag.replace(/^#/, '').trim())
        .filter(Boolean);

      // Combine date and time into proper Date object
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      if (isNaN(startDateTime.getTime())) {
        toast.error('Please select a valid date and time');
        setLoading(false);
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description || formData.shortDescription || '',
        startDate: startDateTime,
        mode: formData.mode,
        location: formData.location,
        meetingLink: formData.meetingLink,
        registrationLink: formData.registrationLink || '',
        contactInfo: formData.contactInfo || '',
        tags: tags,
        organizer: formData.organizer,
        organizerEmail: formData.organizerEmail,
        organizerId: user.uid,
        coverImage: coverImageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onEventCreate(eventData);

      // Reset form
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        startDate: '',
        startTime: '',
        mode: 'offline',
        location: '',
        meetingLink: '',
        registrationLink: '',
        contactInfo: '',
        tags: '',
        organizer: user?.displayName || '',
        organizerEmail: user?.email || ''
      });
      removeImage();
      onClose?.();

    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Photo (JPG/PNG)
          </label>
          <div className="relative">
            {coverImageUrl ? (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={coverImageUrl}
                  alt="Event preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                {uploadingImage ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload event photo</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder="2–3 lines describing the event"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              required
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        {/* Event Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Mode *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'offline', icon: MapPin, label: 'Offline Event' },
              { value: 'online', icon: Video, label: 'Online Event' }
            ].map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode: mode.value }))}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.mode === mode.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
              >
                <mode.icon className="w-4 h-4" />
                <span className="font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location/Meeting Link */}
        {formData.mode === 'online' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Meeting Link *
              </label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleInputChange}
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Provide the meeting link for online events (Zoom, Google Meet, Teams, etc.)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location (e.g., 'Conference Room A, Main Building')"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Provide the physical location for offline events</p>
            </div>
          </div>
        )}

        {/* Registration & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              Registration Link (Optional)
            </label>
            <input
              type="url"
              name="registrationLink"
              value={formData.registrationLink}
              onChange={handleInputChange}
              placeholder="https://forms.google.com/ai-ml-workshop-registration"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AtSign className="w-4 h-4 inline mr-1" />
              Contact (Email or Phone)
            </label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              placeholder="aiworkshop@gmail.com or +91-9876543210"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-1" />
            Hashtags / Keywords (Optional)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="#AI, #MachineLearning, #Startup, #CareerGuidance"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : uploadingImage ? 'Uploading Image...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventFixed;
