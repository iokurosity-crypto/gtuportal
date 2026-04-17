import api from './axios';
import { toast } from "sonner";

/**
 * Create a new post
 */
export const postStatus = async (postData) => {
  try {
    const response = await api.post('/posts', {
      text: postData.content || postData.text || '',
      content: postData.content || postData.text || '',
      image: postData.image || postData.postImage || '',
      images: Array.isArray(postData.images) ? postData.images : [],
      video: postData.video || '',
      title: postData.title || '',
      tags: Array.isArray(postData.tags) ? postData.tags : []
    });
    toast.success("Post created successfully");
    return response.data;
  } catch (err) {
    console.error('Post error:', err);
    toast.error("Failed to create post");
    throw err;
  }
};

/**
 * Get all posts
 */
export const getStatus = (setAllStatus) => {
  api.get('/posts')
    .then(res => setAllStatus(res.data || []))
    .catch(err => {
      console.error("getStatus error:", err);
      setAllStatus([]);
    });
  return () => {};
};

/**
 * Get posts by a specific user
 */
export const getSingleStatus = (setAllStatus, userId) => {
  api.get(`/posts/user/${userId}`)
    .then(res => setAllStatus(res.data || []))
    .catch(err => {
      console.error("getSingleStatus error:", err);
      setAllStatus([]);
    });
  return () => {};
};

/**
 * Like/Unlike a post
 */
export const likePost = async (userId, postId, alreadyLiked) => {
  try {
    const response = alreadyLiked 
      ? await api.delete(`/posts/${postId}/like`)
      : await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (err) {
    console.error('Like error:', err);
    throw err;
  }
};

/**
 * Get likes for a post
 */
export const getLikesByUser = (userId, postId, setLiked, setLikesCount) => {
  api.get(`/posts/${postId}/likes`)
    .then(res => {
      const data = res.data;
      setLikesCount(data.count || 0);
      setLiked(data.liked || false);
    })
    .catch(err => {
      console.error("getLikesByUser error:", err);
      setLikesCount(0);
      setLiked(false);
    });
  return () => {};
};

/**
 * Add a comment to a post
 */
export const commentPost = async (postId, commentText, userId) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, { text: commentText });
    return response.data;
  } catch (err) {
    console.error('Comment error:', err);
    toast.error("Failed to add comment");
    throw err;
  }
};

/**
 * Get comments for a post
 */
export const getComments = (postId, setComments) => {
  api.get(`/posts/${postId}/comments`)
    .then(res => setComments(res.data || []))
    .catch(err => {
      console.error("getComments error:", err);
      setComments([]);
    });
  return () => {};
};

/**
 * Update a post
 */
export const updatePost = async (postId, updatedData) => {
  try {
    const response = await api.put(`/posts/${postId}`, {
      text: updatedData.content || updatedData.text || '',
      content: updatedData.content || updatedData.text || '',
      image: updatedData.image || updatedData.postImage || '',
      images: Array.isArray(updatedData.images) ? updatedData.images : [],
      video: updatedData.video || '',
      title: updatedData.title || '',
      tags: Array.isArray(updatedData.tags) ? updatedData.tags : []
    });
    toast.success("Post updated successfully");
    return response.data;
  } catch (err) {
    console.error('Update error:', err);
    toast.error("Failed to update post");
    throw err;
  }
};

/**
 * Delete a post
 */
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    toast.success("Post deleted successfully");
    return response.data;
  } catch (err) {
    console.error('Delete error:', err);
    toast.error("Failed to delete post");
    throw err;
  }
};
