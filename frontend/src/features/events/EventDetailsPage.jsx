import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import eventsData from '@/data/eventsData.json';
import api from '@/services/axios';

const EventDetailsPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Try to fetch from backend API first
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.log('Failed to fetch from backend, using mock data:', error);
        // Fallback to mock data from eventsData.json
        const event = eventsData.find(e => e.id === id);
        setEvent(event || null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const eventDate = event.startDate instanceof Date 
    ? event.startDate.toLocaleDateString()
    : new Date(event.startDate).toLocaleDateString();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-600 mb-4">{event.description}</p>
      <p className="text-gray-600 mb-4">Date: {eventDate}</p>
      <p className="text-gray-600 mb-4">Location: {event.location}</p>
    </div>
  );
};

export default EventDetailsPage;
