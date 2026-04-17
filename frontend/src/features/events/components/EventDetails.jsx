import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Bookmark, 
  Video,
  ExternalLink,
  User,
  Mail,
  CheckCircle,
  Globe,
  Tag
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const EventDetails = ({ event, onClose, onRSVP, onSave, onShare }) => {
  const { user } = useAuth();
  const [isRSVPed, setIsRSVPed] = useState(event.attendees?.includes(user?.uid));
  const [isSaved, setIsSaved] = useState(event.savedBy?.includes(user?.uid));
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);

  const handleRSVP = async () => {
    if (isRSVPLoading) return;
    setIsRSVPLoading(true);
    
    try {
      await onRSVP(event.id, !isRSVPed);
      setIsRSVPed(!isRSVPed);
    } catch (error) {
      console.error('RSVP failed:', error);
    } finally {
      setIsRSVPLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href + `/event/${event.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/event/${event.id}`);
    }
    onShare?.(event.id);
  };

  const handleSave = async () => {
    try {
      await onSave(event.id, !isSaved);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const isUpcoming = new Date(event.startDate) > new Date();
  const isPast = new Date(event.endDate) < new Date();
  const isOnline = event.mode === 'online';
  const isOffline = event.mode === 'offline';
  const isHybrid = event.mode === 'hybrid';

  const getModeIcon = () => {
    if (isOnline) return <Video className="w-5 h-5" />;
    if (isOffline) return <MapPin className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  const getModeColor = () => {
    if (isOnline) return 'bg-purple-100 text-purple-700';
    if (isOffline) return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {event.coverImage && (
            <div className="h-64 overflow-hidden">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center space-x-3">
              <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getModeColor()}`}>
                {getModeIcon()}
                <span className="capitalize">{event.mode}</span>
              </span>
              {isUpcoming && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Upcoming
                </span>
              )}
              {isPast && (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  Past Event
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRSVP}
                disabled={isPast || isRSVPLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isPast
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isRSVPed
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${isRSVPLoading ? 'opacity-75' : ''}`}
              >
                {isRSVPLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : isPast ? (
                  'Event Ended'
                ) : isRSVPed ? (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    You're Going
                  </div>
                ) : (
                  'RSVP to Event'
                )}
              </button>

              <button
                onClick={handleSave}
                className={`p-3 rounded-lg transition-colors ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {event.attendees?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Attending</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this event</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        <span>#{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendees Preview */}
              {event.attendees && event.attendees.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Who's going ({event.attendees.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    {event.attendees.slice(0, 8).map((attendeeId, index) => (
                      <div
                        key={attendeeId}
                        className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                        style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                      >
                        <span className="text-xs font-medium text-gray-600">
                          {attendeeId.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {event.attendees.length > 8 && (
                      <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{event.attendees.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Date and Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Date & Time
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  {isOnline ? (
                    <Video className="w-5 h-5 mr-2" />
                  ) : (
                    <MapPin className="w-5 h-5 mr-2" />
                  )}
                  {isOnline ? 'Online Event' : 'Location'}
                </h3>
                <div className="text-sm text-gray-700">
                  {isOnline ? (
                    <div>
                      <p className="mb-2">This is an online event</p>
                      {event.meetingLink && (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p>{event.location}</p>
                  )}
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Organizer
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {event.organizer?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.organizer}</p>
                      {event.organizerEmail && (
                        <a
                          href={`mailto:${event.organizerEmail}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Contact
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity */}
              {event.maxAttendees && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Capacity
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spots taken</span>
                      <span className="font-medium text-gray-900">
                        {event.attendees?.length || 0} / {event.maxAttendees}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(((event.attendees?.length || 0) / event.maxAttendees) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.maxAttendees - (event.attendees?.length || 0)} spots remaining
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
