import eventsData from '@/data/eventsData.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class EventsService {
  // Create a new event
  static async createEvent(eventData) {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }
      
      const event = await response.json();
      return event._id || event.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Get events with real-time updates using polling
  static getEventsRealtime(callback, options = {}) {
    const limit = options.limit || 60;
    const page = options.page || 1;
    
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events?limit=${limit}&page=${page}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          // Handle both pagination response and direct array
          const events = result.data || result || [];
          callback(Array.isArray(events) ? events : []);
        } else {
          // Fallback to mock data
          callback(eventsData);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data on error
        callback(eventsData);
      }
    };

    // Fetch immediately
    fetchEvents();

    // Poll for updates every 10 seconds for real-time feeling
    const interval = setInterval(fetchEvents, 10000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // Get single event
  static async getEvent(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Fallback to mock data
      return eventsData.find(e => e.id === eventId) || null;
    } catch (error) {
      console.error('Error getting event:', error);
      return eventsData.find(e => e.id === eventId) || null;
    }
  }

  // Update event
  static async updateEvent(eventId, updateData) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete event
  static async deleteEvent(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // RSVP to event
  static async toggleRSVP(eventId, userId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.isAttending;
      }
      throw new Error('Failed to toggle RSVP');
    } catch (error) {
      console.error('Error toggling RSVP:', error);
      throw error;
    }
  }

  // Save/Unsave event
  static async toggleSaveEvent(eventId, userId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.isSaved;
      }
      throw new Error('Failed to toggle save');
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  }

  // Get events by user
  static async getUserEvents(userId, callback) {
    try {
      callback(eventsData.filter(e => e.organizerId === userId));
    } catch (error) {
      console.error('Error fetching user events:', error);
      callback([]);
    }
    return () => {};
  }

  // Get events user is attending
  static async getAttendingEvents(userId, callback) {
    try {
      callback(eventsData.filter(e => e.attendees?.includes(userId)));
    } catch (error) {
      console.error('Error fetching attending events:', error);
      callback([]);
    }
    return () => {};
  }

  // Get saved events
  static async getSavedEvents(userId, callback) {
    try {
      callback(eventsData.filter(e => e.savedBy?.includes(userId)));
    } catch (error) {
      console.error('Error fetching saved events:', error);
      callback([]);
    }
    return () => {};
  }

  // Search events
  static async searchEvents(searchTerm, callback) {
    try {
      const results = eventsData.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      callback(results);
    } catch (error) {
      console.error('Error searching events:', error);
      callback([]);
    }
    return () => {};
  }

  // Get upcoming events
  static async getUpcomingEvents(callback, limitCount = 10) {
    try {
      const now = new Date();
      const upcoming = eventsData
        .filter(e => new Date(e.startDate) > now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, limitCount);
      callback(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      callback([]);
    }
    return () => {};
  }

  // Get events by date range
  static async getEventsByDateRange(startDate, endDate, callback) {
    try {
      const results = eventsData.filter(e => {
        const eDate = new Date(e.startDate);
        return eDate >= startDate && eDate <= endDate;
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      callback(results);
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      callback([]);
    }
    return () => {};
  }

  // Calendar Integration Utilities
  static generateGoogleCalendarUrl(event) {
    const startDate = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(event.endDate || event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.mode === 'online' ? event.meetingLink : event.location,
      dates: `${startDate}/${endDate}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static generateOutlookCalendarUrl(event) {
    const startDate = new Date(event.startDate).toISOString();
    const endDate = new Date(event.endDate || event.startDate).toISOString();
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      startdt: startDate,
      enddt: endDate,
      subject: event.title,
      body: event.description,
      location: event.mode === 'online' ? event.meetingLink : event.location
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  static generateYahooCalendarUrl(event) {
    const startDate = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(event.endDate || event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const params = new URLSearchParams({
      v: 60,
      title: event.title,
      desc: event.description,
      st: startDate,
      et: endDate,
      in_loc: event.mode === 'online' ? event.meetingLink : event.location
    });

    return `https://calendar.yahoo.com/?${params.toString()}`;
  }

  static downloadIcsFile(event) {
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}00`;
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alumni Platform//Events//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@alumni-platform.com`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate || event.startDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ''}`,
      `LOCATION:${event.mode === 'online' ? event.meetingLink : event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get event statistics
  static async getEventStats() {
    try {
      const now = new Date();
      const stats = {
        total: eventsData.length,
        upcoming: eventsData.filter(e => new Date(e.startDate) > now).length,
        past: eventsData.filter(e => new Date(e.endDate || e.startDate) < now).length,
        online: eventsData.filter(e => e.mode === 'online').length,
        offline: eventsData.filter(e => e.mode === 'offline').length,
        hybrid: eventsData.filter(e => e.mode === 'hybrid').length,
        totalAttendees: eventsData.reduce((sum, e) => sum + (e.attendees?.length || 0), 0)
      };
      return stats;
    } catch (error) {
      console.error('Error getting event stats:', error);
      return {
        total: 0,
        upcoming: 0,
        past: 0,
        online: 0,
        offline: 0,
        hybrid: 0,
        totalAttendees: 0
      };
    }
  }
}

export default EventsService;
