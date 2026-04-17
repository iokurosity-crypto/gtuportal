/**
 * Challenges Service
 * Handles real-time challenges fetching and posting
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

class ChallengesService {
  // Get challenges with real-time polling
  static subscribeToChallenges(callback, options = {}) {
    const limit = options.limit || 60;
    const page = options.page || 1;

    const fetchChallenges = async () => {
      try {
        const response = await fetch(`${API_URL}/challenges?limit=${limit}&page=${page}`, {
          headers: getAuthHeader()
        });

        if (response.ok) {
          const result = await response.json();
          // Handle both pagination response and direct array
          const challenges = result.data || result || [];
          callback(Array.isArray(challenges) ? challenges : []);
        } else {
          callback([]);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
        callback([]);
      }
    };

    // Fetch immediately
    fetchChallenges();

    // Poll for updates every 10 seconds for real-time feeling
    const interval = setInterval(fetchChallenges, 10000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // Create a new challenge
  static async createChallenge(challengeData) {
    try {
      const response = await fetch(`${API_URL}/challenges`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(challengeData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create challenge');
      }

      const challenge = await response.json();
      return challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  // Get single challenge
  static async getChallenge(challengeId) {
    try {
      const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
        headers: getAuthHeader()
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('Error getting challenge:', error);
      return null;
    }
  }

  // Submit solution to challenge
  static async submitSolution(challengeId, content) {
    try {
      const response = await fetch(`${API_URL}/challenges/${challengeId}/submissions`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to submit solution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting solution:', error);
      throw error;
    }
  }
}

export default ChallengesService;
