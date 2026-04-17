import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Video, Map, Upload, Hash, Clock, Link2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '@/services/imageUploadAPI.js';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CreateEvent = ({ onEventCreate, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    headline: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    mode: 'offline',
    location: '',
    meetingLink: '',
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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.startDate || !formData.startTime) {
        alert('Please fill in all required fields');
        return;
      }

      // Upload cover image if selected
      let imageData = null;
      if (coverImage) {
        imageData = await uploadImageToCloudinary(coverImage);
      }

      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      // Prepare tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim().replace('#', ''))
        .filter(tag => tag.length > 0);

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime,
        endDate: endDateTime,
        mode: formData.mode,
        location: formData.mode === 'online' ? formData.meetingLink : formData.location,
        meetingLink: formData.mode === 'online' ? formData.meetingLink : '',
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        tags: tags,
        organizer: formData.organizer,
        organizerEmail: formData.organizerEmail,
        organizerId: user.uid,
        coverImage: imageData?.url || null,
        imagePublicId: imageData?.publicId || null,
        attendees: [],
        savedBy: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onEventCreate(eventData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        mode: 'offline',
        location: '',
        meetingLink: '',
        maxAttendees: '',
        tags: '',
        organizer: user?.displayName || '',
        organizerEmail: user?.email || ''
      });
      removeImage();
      onClose?.();

    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
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
            Cover Image (Optional)
          </label>
          <div className="relative">
            {imagePreview ? (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Cover preview"
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
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload cover image</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
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
              Headline (for online events)
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="Enter event headline (e.g., 'Tech Talk: AI in Alumni Network')"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Event Mode and Location */}
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

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-1" />
            Tags (Optional)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="tech, networking, workshop (comma separated)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Organizer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizer Name *
            </label>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizer Email *
            </label>
            <input
              type="email"
              name="organizerEmail"
              value={formData.organizerEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Max Attendees (Optional)
            </label>
            <input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="networking, career, workshop"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
