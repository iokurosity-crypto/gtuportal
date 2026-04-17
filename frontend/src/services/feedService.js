/**
 * Feed Service - Uses Backend API
 * Handles all feed-related operations
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

// Get headers with optional auth (for public endpoints)
const getOptionalAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

class FeedService {
  /**
   * Create a new post
   */
  static async createPost(postData) {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          content: postData.content,
          image: postData.image || '',
          tags: postData.tags || []
        })
      });
      if (!response.ok) throw new Error('Failed to create post');
      const result = await response.json();
      return result._id || result.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get posts with real-time updates (polling)
   */
  static getPostsRealtime(callback, options = {}) {
    const { limit = 20 } = options;

    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts?limit=${limit}`, {
          headers: getOptionalAuthHeaders()
        });
        const posts = await response.json();
        callback(posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        callback([]);
      }
    };

    // Fetch immediately
    fetchPosts();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchPosts, 10000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  /**
   * Get single post
   */
  static async getPost(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        headers: getAuthHeader()
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  }

  /**
   * Update post
   */
  static async updatePost(postId, updateData) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update post');
      return await response.json();
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * Delete post
   */
  static async deletePost(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to delete post');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike post
   */
  static async toggleLike(postId, userId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to toggle like');
      return await response.json();
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Add comment
   */
  static async addComment(postId, commentData) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ text: commentData.content || commentData.text })
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get comments
   */
  static getComments(postId, callback) {
    fetch(`${API_URL}/posts/${postId}/comments`, { headers: getAuthHeader() })
      .then(res => res.json())
      .then(comments => callback(comments || []))
      .catch(err => {
        console.error('Error getting comments:', err);
        callback([]);
      });
    return () => {};
  }

  /**
   * Share post
   */
  static async sharePost(postId, shareData) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/share`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(shareData)
      });
      if (!response.ok) throw new Error('Failed to share post');
      return await response.json();
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }
}

export default FeedService;

// Firestore Collections Structure:
// posts/{postId}
// ├── content: string
// ├── authorId: string
// ├── authorName: string
// ├── authorPhoto: string
// ├── authorRole: string (Alumni/Student)
// ├── authorTitle: string
// ├── authorCompany: string
// ├── image: {
// │   url: string,
// │   publicId: string,
// │   width: number,
// │   height: number

