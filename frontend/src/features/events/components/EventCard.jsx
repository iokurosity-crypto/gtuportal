import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Bookmark, 
  ExternalLink,
  Video,
  Map,
  User,
  CheckCircle,
  Link2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui';
import { sendConnectionRequest } from '@/services/socialService';

const EventCard = ({ event, onShare, onSave, onViewDetails }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(event.savedBy?.includes(user?.uid));
  const isOnline = event.mode === 'online';
  const isOffline = event.mode === 'offline';
  const hasRegistrationLink = Boolean(event.registrationLink && String(event.registrationLink).trim());

  const toJSDate = (v) => {
    try {
      if (!v) return new Date();
      if (typeof v.toDate === 'function') {
        const d = v.toDate();
        return isNaN(d.getTime()) ? new Date() : d;
      }
      const d = v instanceof Date ? v : new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href + `/event/${event._id || event.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/event/${event._id || event.id}`);
    }
    onShare?.(event._id || event.id);
  };

  const handleSave = async () => {
    try {
      await onSave(event._id || event.id, !isSaved);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const start = toJSDate(event.date || event.startDate);
  const now = new Date();
  const isUpcoming = start > now;
  const isPast = start < now;

  const getEventStatusColor = () => {
    if (isPast) return 'bg-gray-100 text-gray-600';
    if (isUpcoming) return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getEventStatusText = () => {
    if (isPast) return 'Past Event';
    if (isUpcoming) return 'Upcoming';
    return 'Ongoing';
  };

  const getModeIcon = () => {
    if (isOnline) return <Video className="w-4 h-4" />;
    if (isOffline) return <MapPin className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getModeColor = () => {
    if (isOnline) return 'bg-purple-100 text-purple-700';
    if (isOffline) return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
      {/* Event Header Image */}
      <div className="relative h-56 overflow-hidden flex-shrink-0">
        {event.coverImage && event.coverImage.trim() !== "" ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.querySelector('.fallback-gradient').style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="fallback-gradient w-full h-56 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
          style={{ display: event.coverImage ? 'none' : 'flex' }}
        >
          <Calendar className="w-16 h-16 text-white opacity-50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${getEventStatusColor()}`}>
            {getEventStatusText()}
          </span>
        </div>

        {/* Mode Badge */}
        <div className="absolute top-4 right-4">
          <span className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold shadow-lg ${getModeColor()}`}>
            {getModeIcon()}
            <span className="capitalize">{event.mode}</span>
          </span>
        </div>

        {/* Date Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center shadow-xl">
            <div className="text-2xl font-black text-gray-900">{format(start, 'd')}</div>
            <div className="text-xs font-bold text-gray-600 uppercase">{format(start, 'MMM')}</div>
          </div>
        </div>
      </div>

      {/* Event Content - Fixed Height Container */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title - Fixed Height */}
        <h3 className="text-xl font-black text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors h-14">
          {event.title}
        </h3>

        {/* Description - Fixed Height */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed h-10">
          {event.description}
        </p>

        {/* Event Details - Fixed Height */}
        <div className="space-y-2 mb-4 min-h-20">
          {/* Date and Time */}
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <span className="font-bold line-clamp-1">
              {format(start, 'MMM d, yyyy')} • {format(start, 'h:mm a')}
            </span>
          </div>
          
          {/* Location or Meeting Link */}
          <div className="flex items-center gap-3 text-sm text-slate-600">
            {isOnline ? (
              <>
                <Video className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <span className="font-bold">Virtual Event</span>
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="font-bold line-clamp-1">{event.location || 'Location TBA'}</span>
              </>
            )}
          </div>

          {/* Organizer - Fixed Height Line */}
          {event.organizer && (
            <div className="flex items-center text-sm text-gray-600 line-clamp-1">
              <User className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate">By {event.organizer}</span>
            </div>
          )}
        </div>

        {/* Tags - Fixed Height */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 h-10 overflow-hidden">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex-shrink-0"
              >
                #{tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex-shrink-0">
                +{event.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Spacer to Push Button to Bottom */}
        <div className="flex-grow"></div>

        {/* Contact Info - Compact */}
        {event.organizerEmail && (
          <div className="text-xs text-gray-500 mb-4 line-clamp-1">
            <a href={`mailto:${event.organizerEmail}`} className="text-blue-600 hover:underline">
              {event.organizerEmail}
            </a>
          </div>
        )}

        {/* Action Button - Smart CTA */}
        {isOnline && event.meetingLink ? (
          // Online event with meeting link
          <Button
            className="w-full rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white py-3 flex-shrink-0"
            onClick={() => window.open(event.meetingLink, '_blank', 'noopener,noreferrer')}
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
        ) : isOffline && hasRegistrationLink ? (
          // Offline event with registration link
          <Button
            className="w-full rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white py-3 flex-shrink-0"
            onClick={() => window.open(event.registrationLink, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Register Now
          </Button>
        ) : isOnline ? (
          // Online event without meeting link
          <Button
            disabled
            className="w-full rounded-xl font-bold bg-slate-100 text-slate-500 py-3 cursor-default flex-shrink-0"
          >
            <Video className="w-4 h-4 mr-2" />
            Virtual Event
          </Button>
        ) : (
          // Offline event without registration link
          <div className="text-sm text-slate-600 font-semibold text-center py-3 flex-shrink-0">
            <a href={`mailto:${event.organizerEmail}`} className="text-blue-600 hover:underline">
              Contact {event.organizer} for details
            </a>
          </div>
        )}

        {/* Progress Bar for Capacity */}
        {event.maxAttendees && (
          <div className="mt-3 flex-shrink-0">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Capacity</span>
              <span>{Math.round(((event.attendees?.length || 0) / event.maxAttendees) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(((event.attendees?.length || 0) / event.maxAttendees) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
