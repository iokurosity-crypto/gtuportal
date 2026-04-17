/**
 * Data Service - Uses Backend API instead of Firebase
 * All data operations go through the Express backend + MongoDB
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Get auth token from localStorage
 */
const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

/**
 * Fetch opportunities from backend with real-time polling
 */
export const subscribeToOpportunities = (callback) => {
  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`${API_URL}/opportunities?limit=50&page=1`, {
        headers: getAuthHeader()
      });
      const result = await res.json();
      
      // Handle both old format (array) and new format (object with data property)
      const opportunities = result.data || result || [];
      callback(Array.isArray(opportunities) ? opportunities : []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      callback([]);
    }
  };

  // Fetch immediately
  fetchOpportunities();

  // Poll every 10 seconds for real-time updates
  const interval = setInterval(fetchOpportunities, 10000);
  
  // Return unsubscribe function
  return () => clearInterval(interval);
};

/**
 * Fetch startups from backend
 */
export const subscribeToStartups = (callback) => {
  const fetchStartups = async () => {
    try {
      const res = await fetch(`${API_URL}/startups`, {
        headers: getAuthHeader()
      });
      const startups = await res.json();
      callback(startups || []);
    } catch (error) {
      console.error('Error fetching startups:', error);
      callback([]);
    }
  };

  // Fetch immediately
  fetchStartups();

  // Poll every 30 seconds
  const interval = setInterval(fetchStartups, 30000);
  
  return () => clearInterval(interval);
};

/**
 * Add a new document to backend
 */
export const addData = async (path, data) => {
  try {
    const res = await fetch(`${API_URL}/${path}`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message };
    }
    
    const result = await res.json();
    return { success: true, id: result._id || result.id, data: result };
  } catch (error) {
    console.error(`Error adding to ${path}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a question
 */
export const addQuestion = async (questionData, user) => {
  return await addData('qa', {
    title: questionData.title,
    content: questionData.content,
    authorId: user.id,
    answers: []
  });
};

/**
 * Add an opportunity
 */
export const addOpportunity = async (opportunity, user) => {
  try {
    const res = await fetch(`${API_URL}/opportunities`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        title: opportunity.title,
        description: opportunity.description,
        company: opportunity.company,
        location: opportunity.location,
        opportunityType: opportunity.type || opportunity.opportunityType || 'Job',
        experienceLevel: opportunity.experienceLevel || 'Entry Level',
        salary: opportunity.salary || opportunity.stipend || '',
        workMode: opportunity.workMode || 'Remote',
        salaryRange: opportunity.salaryRange || 'Entry',
        department: opportunity.department || 'CSE',
        domain: opportunity.domain || 'software',
        deadline: opportunity.deadline || '',
        applicationLink: opportunity.applicationLink || '',
        skills: opportunity.skills || []
      })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to add opportunity');
    }
    const result = await res.json();
    return { success: true, id: result._id || result.id, data: result };
  } catch (error) {
    console.error('Error adding opportunity:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a blog
 */
export const addBlog = async (blog, user) => {
  return await addData('blogs', {
    title: blog.title,
    content: blog.content,
    authorId: user.id,
    category: blog.category || 'General',
    tags: blog.tags || [],
    createdAt: new Date().toISOString()
  });
};

/**
 * Add a startup
 */
export const addStartup = async (startup, user) => {
  return await addData('startups', {
    title: startup.title,
    description: startup.description,
    founder: user.name,
    userId: user.id,
    website: startup.website,
    industry: startup.industry,
    createdAt: new Date().toISOString()
  });
};

/**
 * Get data from a collection
 */
export const getData = async (path) => {
  try {
    const res = await fetch(`${API_URL}/${path}`, {
      headers: getAuthHeader()
    });
    
    if (!res.ok) {
      console.error(`Error fetching ${path}:`, res.status);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error(`Error getting ${path}:`, error);
    return [];
  }
};

/**
 * Update data in backend
 */
export const updateData = async (path, id, updates) => {
  try {
    const res = await fetch(`${API_URL}/${path}/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    
    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message };
    }
    
    const result = await res.json();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error updating ${path}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete data from backend
 */
export const deleteData = async (path, id) => {
  try {
    const res = await fetch(`${API_URL}/${path}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    if (!res.ok) {
      return { success: false, error: 'Delete failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${path}:`, error);
    return { success: false, error: error.message };
  }
};
