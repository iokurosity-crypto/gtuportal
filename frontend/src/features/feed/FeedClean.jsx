import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, TrendingUp, Users, Calendar, Hash, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, Image as ImageIcon, MapPin, User, X, Video, ChevronLeft, ChevronRight, Trash2, Search, UserPlus, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealTime } from '../../contexts/RealTimeContext';
import { Avatar, AvatarFallback, AvatarImage, Button, Input } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { sendConnectionRequest, subscribeToConnections, subscribeToOutgoingRequests } from '@/services/socialService';
import { uploadImage } from '@/utils/cloudinary.js';
import { toast } from 'sonner';
import FeedService from '@/services/feedService.js';
import api from '@/services/axios';
import { feedPostsData } from '@/data/feedPostsData';

import { useNotifications } from '@/contexts/NotificationContext.jsx';

const getAvatarSrc = (person, fallback = null) => (
  person?.profilePicture ||
  person?.profilePhoto ||
  person?.photoURL ||
  person?.imageLink ||
  person?.avatar ||
  fallback ||
  null
);

const PostDescription = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200;

  if (!content) return null;

  const renderContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold break-all">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (content.length <= maxLength) {
    return <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{renderContent(content)}</p>;
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
        {isExpanded ? renderContent(content) : renderContent(content.substring(0, maxLength) + '...')}
      </p>
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors"
        >
          ...see more
        </button>
      )}
    </div>
  );
};

const FeedClean = () => {
  const { user, requireAuth } = useAuth();
  const { socket } = useRealTime();
  const { suggestions, activities: networkActivities } = useNotifications();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', images: [], imageFiles: [], imagePreviews: [], video: null, videoFile: null, videoPreviews: null, postType: 'update' });
  const [commentInputs, setCommentInputs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const [carouselIndex, setCarouselIndex] = useState({});
  const [showComments, setShowComments] = useState({}); // Track visibility of comments for each post
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const dialogDragRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  const renderPostContent = (content) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {part}
          </a>
        );
      }
      return part;
    });
  };
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

  const handleDeletePost = async (post) => {
    const currentUserId = user?._id || user?.id || user?.uid;
    const postAuthorId = post.authorId?._id || post.authorId || '';
    if (!currentUserId || currentUserId !== postAuthorId) return;
    
    const ok = window.confirm('Delete this post? This action cannot be undone.');
    if (!ok) return;
    
    try {
      const response = await api.delete(`/posts/${post._id || post.id}`);
      if (response.status === 200 || response.status === 204) {
        setPosts(posts.filter(p => (p._id || p.id) !== (post._id || post.id)));
        setFilteredPosts(filteredPosts.filter(p => (p._id || p.id) !== (post._id || post.id)));
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error('Delete post failed:', error);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  // Fetch posts from MongoDB via API
  useEffect(() => {
    let intervalId = null;
    
    const transformPostData = (posts) => {
      return posts.map(post => ({
        ...post,
        id: post._id || post.id,
        // Map authorId populated object to flat fields for display
        authorName: post.authorId?.name || post.authorName || 'Anonymous',
        authorPhoto: getAvatarSrc(post.authorId, post.authorPhoto),
        authorRole: post.authorId?.currentJobTitle || post.authorId?.role || post.authorRole || 'Alumni',
        authorCompany: post.authorId?.currentCompany || post.authorCompany || '',
        authorId: post.authorId?._id || post.authorId || '', // Keep the ID for linking
        comments: (post.comments || []).map(comment => {
          const cAuthor = comment.authorId || {};
          const authorName = cAuthor.name || comment.authorName || (cAuthor.displayName || cAuthor.email?.split('@')[0] || 'Alumni');
          const authorRole = cAuthor.currentJobTitle || cAuthor.title || cAuthor.role || comment.authorRole || (cAuthor.role === 'alumni' ? 'Alumni' : '');
          
          // Debug logging
          if (comment.id) {
            console.log('📝 [Feed] Comment mapped:', {
              commentId: comment.id,
              hasAuthorIdObj: typeof cAuthor === 'object' && cAuthor?.name,
              authorName,
              authorRole,
              cAuthor
            });
          }
          
          return {
            ...comment,
            id: comment._id || comment.id,
            authorName,
            authorPhoto: getAvatarSrc(cAuthor, comment.authorPhoto),
            authorRole,
            content: comment.text || comment.content || ''
          };
        })
      }));
    };
    
    const fetchPosts = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Only add auth header if token exists
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Fetch from API first
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/posts`,
          { headers }
        );
        
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const postsData = await response.json();
        let posts = Array.isArray(postsData) ? postsData : postsData.posts || [];
        
        // If API returns posts, use them; otherwise use professional feed data
        if (posts.length === 0) {
          posts = feedPostsData.map(post => ({
            ...post,
            _id: post.id,
            createdAt: new Date(post.createdAt),
            authorId: post.author.id,
            authorName: post.author.name,
            authorPhoto: post.author.avatar,
            authorRole: post.author.role,
            authorCompany: post.author.company,
          }));
        }
        
        // Transform data structure
        posts = transformPostData(posts);
        
        // Sort by createdAt descending
        posts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        
        setPosts(posts);
        setFilteredPosts(posts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Use professional feed data as fallback
        let fallbackPosts = feedPostsData.map(post => ({
          ...post,
          _id: post.id,
          createdAt: new Date(post.createdAt),
          authorId: post.author.id,
          authorName: post.author.name,
          authorPhoto: post.author.avatar,
          authorRole: post.author.role,
          authorCompany: post.author.company,
        }));
        fallbackPosts = transformPostData(fallbackPosts);
        setPosts(fallbackPosts);
        setFilteredPosts(fallbackPosts);
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchPosts();

    // Use WebSocket if available for real-time updates, otherwise fallback to polling
    const socketContext = window.__realTimeSocket; // Check if socket is available globally
    
    if (socketContext) {
      // Socket-based real-time updates
      socketContext.on?.('post-created', fetchPosts);
      socketContext.on?.('post-updated', fetchPosts);
      
      return () => {
        socketContext.off?.('post-created', fetchPosts);
        socketContext.off?.('post-updated', fetchPosts);
      };
    } else {
      // Fallback: Polling every 30 seconds (reduced from 15s to 30s for less server load)
      intervalId = setInterval(fetchPosts, 30000);
      
      // Refresh when window regains focus
      const handleFocus = () => fetchPosts();
      window.addEventListener('focus', handleFocus);
      
      return () => {
        if (intervalId) clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  // Listen for new posts, events, and challenges via socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (postData) => {
      console.log('📝 New post received via socket:', postData);
      setPosts(prev => [postData, ...prev]);
      setFilteredPosts(prev => [postData, ...prev]);
      toast.success('New post!' );
    };

    const handleNewEvent = (eventData) => {
      console.log('📅 New event received via socket:', eventData);
      // Add event to feed as a special post type
      const eventPost = {
        ...eventData,
        postType: 'event',
        createdAt: new Date().toISOString()
      };
      setPosts(prev => [eventPost, ...prev]);
      setFilteredPosts(prev => [eventPost, ...prev]);
      toast.success('New event posted!');
    };

    const handleNewChallenge = (challengeData) => {
      console.log('🏆 New challenge received via socket:', challengeData);
      // Add challenge to feed as a special post type
      const challengePost = {
        ...challengeData,
        postType: 'challenge',
        createdAt: new Date().toISOString()
      };
      setPosts(prev => [challengePost, ...prev]);
      setFilteredPosts(prev => [challengePost, ...prev]);
      toast.success('New challenge posted!');
    };

    // Handle profile picture updates - refresh posts to show updated photos
    const handleProfilePictureUpdate = (event) => {
      console.log('📸 [Feed] Profile picture updated:', event);
      // Update all posts by the user who changed their photo
      setPosts(prev => prev.map(post => {
        if (post.authorId === event.userId || post.authorId?._id === event.userId) {
          return {
            ...post,
            authorPhoto: event.profilePhoto || event.profilePicture
          };
        }
        return post;
      }));
      setFilteredPosts(prev => prev.map(post => {
        if (post.authorId === event.userId || post.authorId?._id === event.userId) {
          return {
            ...post,
            authorPhoto: event.profilePhoto || event.profilePicture
          };
        }
        return post;
      }));
    };

    socket.on('post-created', handleNewPost);
    socket.on('event-created', handleNewEvent);
    socket.on('challenge-created', handleNewChallenge);
    socket.on('profile-picture-updated', handleProfilePictureUpdate);
    
    return () => {
      socket.off('post-created', handleNewPost);
      socket.off('event-created', handleNewEvent);
      socket.off('challenge-created', handleNewChallenge);
      socket.off('profile-picture-updated', handleProfilePictureUpdate);
    };
  }, [socket]);

  // Track connections state for current user to drive button labels
  useEffect(() => {
    if (!user?.uid) return;
    const unsubConnected = subscribeToConnections(user.uid, (cons) => {
      const ids = new Set(cons.map(c => c.partnerId));
      setConnectedIds(ids);
    });
    const unsubOutgoing = subscribeToOutgoingRequests(user.uid, (reqs) => {
      const pend = new Set(reqs.filter(r => r.status === 'pending').map(r => r.toId));
      setPendingIds(pend);
    });
    return () => {
      unsubConnected && unsubConnected();
      unsubOutgoing && unsubOutgoing();
    };
  }, [user?.uid]);

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post =>
      (post.text || post.content)?.toLowerCase().includes(query) ||
      post.authorName?.toLowerCase().includes(query) ||
      post.authorCompany?.toLowerCase().includes(query) ||
      post.authorRole?.toLowerCase().includes(query)
    );

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  // Drag handlers for dialog
  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    const dialogEl = dialogDragRef.current?.querySelector('[role="dialog"]');
    if (!dialogEl) return;

    const rect = dialogEl.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dialogDragRef.current) return;

    const dialogEl = dialogDragRef.current?.querySelector('[role="dialog"]');
    if (!dialogEl) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep dialog within viewport bounds
    const maxX = window.innerWidth - dialogEl.offsetWidth;
    const maxY = window.innerHeight - dialogEl.offsetHeight;

    setDialogPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach/detach event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDragging, dragOffset]);

  // Search alumni and posts
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const searchQuery = query.toLowerCase();

    try {
      // Search in posts
      const postResults = posts.filter(post =>
        post.text?.toLowerCase().includes(searchQuery) ||
        post.authorName?.toLowerCase().includes(searchQuery) ||
        post.authorRole?.toLowerCase().includes(searchQuery)
      );

      // Search in users (simplified - would need backend endpoint for production)
      const userResults = [
        { id: 'user1', name: 'Sarah Johnson', role: 'Software Engineer', company: 'Google', photoURL: null },
        { id: 'user2', name: 'Michael Chen', role: 'Product Manager', company: 'Microsoft', photoURL: null },
        { id: 'user3', name: 'Emily Davis', role: 'UX Designer', company: 'Apple', photoURL: null }
      ].filter(user =>
        user.name.toLowerCase().includes(searchQuery) ||
        user.role.toLowerCase().includes(searchQuery) ||
        user.company.toLowerCase().includes(searchQuery)
      );

      setSearchResults([
        ...postResults.map(post => ({
          type: 'post',
          id: post._id || post.id,
          title: (post.text || post.content || '').substring(0, 50) + '...',
          subtitle: `By ${post.authorName}`,
          data: post
        })),
        ...userResults.map(user => ({
          type: 'user',
          id: user.id,
          title: user.name,
          subtitle: `${user.role} at ${user.company}`,
          data: user
        }))
      ]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => setShowCreatePost(false);

  const [postCreationLoading, setPostCreationLoading] = useState(false);

  // Create post
  const handleCreatePost = async () => {
    // Text is required - media is optional
    if (!newPost.content.trim()) {
      toast.error("Please write some text for your post");
      return;
    }

    setPostCreationLoading(true);
    const postToast = toast.loading("Creating your post...");

    try {
      let imageUrls = [];

      if (newPost.imageFiles && newPost.imageFiles.length > 0) {
        // Upload all images to Cloudinary with proper error handling
        for (let i = 0; i < newPost.imageFiles.length; i++) {
          try {
            const file = newPost.imageFiles[i];
            console.log(`Uploading image ${i + 1}/${newPost.imageFiles.length}...`);
            const upload = await uploadImage(file);
            if (upload?.url) imageUrls.push(upload.url);
          } catch (error) {
            console.warn(`Failed to upload image ${i + 1}:`, error.message);
            toast.warning(`Image ${i + 1} upload skipped: ${error.message}`);
          }
        }
        
        if (imageUrls.length === 0) {
          throw new Error('Failed to upload any images. Please check file sizes and try again.');
        }
      }

      let videoUrl = null;
      if (newPost.videoFile) {
        try {
          console.log('Uploading video...');
          const upload = await uploadImage(newPost.videoFile);
          videoUrl = upload?.url || null;
        } catch (error) {
          console.warn('Failed to upload video:', error.message);
          toast.warning(`Video upload skipped: ${error.message}`);
        }
      }

      const postData = {
        text: newPost.content,
        images: imageUrls,
        image: imageUrls.length > 0 ? imageUrls[0] : null,
        video: videoUrl,
        postType: newPost.postType || 'update'
      };

      const response = await api.post('posts', postData);
      const newPostData = response.data;
      
      // Transform the returned post data to match display structure
      const transformedPost = {
        ...newPostData,
        id: newPostData._id || newPostData.id,
        authorName: newPostData.authorId?.name || user.displayName || user.name || 'You',
        authorPhoto: getAvatarSrc(newPostData.authorId, getAvatarSrc(user)),
        authorRole: newPostData.authorId?.currentJobTitle || user.currentJobTitle || 'Alumni',
        authorCompany: newPostData.authorId?.currentCompany || user.company || '',
        authorId: newPostData.authorId?._id || newPostData.authorId || user._id
      };
      
      setPosts([transformedPost, ...posts]);
      setFilteredPosts([transformedPost, ...filteredPosts]);

      // Emit socket event for real-time update
      if (socket) {
        socket.emit('post-created', transformedPost);
        console.log('📡 Post emitted via socket.io');
      }

      // Track activity - Log the post creation activity
      try {
        await api.post('activity', {
          type: 'post_created',
          postId: newPostData._id || newPostData.id,
          postType: newPost.postType || 'update',
          content: newPost.content.substring(0, 100),
          timestamp: new Date().toISOString()
        }).catch(err => console.warn('Activity tracking failed:', err));
      } catch (actError) {
        console.warn('Could not track activity:', actError);
      }

      toast.success("Post created successfully!", { id: postToast });
      setNewPost({ content: '', images: [], imageFiles: [], imagePreviews: [], video: null, videoFile: null, videoPreviews: null, postType: 'update' });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMsg = error.message.includes('size') 
        ? `${error.message} Please compress your files or try with smaller media.`
        : error.message;
      toast.error(`Error creating post: ${errorMsg}`, { id: postToast });
    } finally {
      setPostCreationLoading(false);
    }
  };

  // Like post
  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const currentUserId = user._id || user.id || user.uid;
      const targetPost = posts.find(p => (p._id || p.id) === postId);
      const alreadyLiked = (targetPost?.likes || []).some(id => (id?.toString?.() || id) === currentUserId);

      const response = alreadyLiked
        ? await api.delete(`/posts/${postId}/like`)
        : await api.post(`/posts/${postId}/like`);
      const data = response.data;
      
      if (data) {
        // Update local state instead of full refresh
        const updatePosts = (prev) => prev.map(p => {
          if (p._id === postId || p.id === postId) {
            let newLikes = [...(p.likes || [])];
            if (data.liked) {
              if (!newLikes.some(id => (id?.toString?.() || id) === currentUserId)) {
                newLikes.push(currentUserId);
              }
            } else {
              newLikes = newLikes.filter(id => (id?.toString?.() || id) !== currentUserId);
            }
            return { ...p, likes: newLikes };
          }
          return p;
        });

        setPosts(updatePosts);
        setFilteredPosts(updatePosts);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Unable to update like. Please try again.');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => {
      const isOpen = !prev[postId];
      if (isOpen) {
        // Focus the input after a short delay to allow DOM update
        setTimeout(() => {
          const input = document.getElementById(`comment-input-${postId}`);
          if (input) input.focus();
        }, 100);
      }
      return { ...prev, [postId]: isOpen };
    });
  };

  // Add comment
  const handleAddComment = async (postId) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        text: commentText.trim()
      });

      const data = response.data;
      if (data) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        toast.success('Comment posted!');

        const newComment = data.comment
          ? {
              ...data.comment,
              id: data.comment._id || data.comment.id,
              authorId: typeof data.comment.authorId === 'object' ? data.comment.authorId : undefined,
              authorName: data.comment.authorId?.name || data.comment.authorName || user.displayName || user.name || (user.email?.split('@')[0] || 'You'),
              authorPhoto: getAvatarSrc(data.comment.authorId, getAvatarSrc(user)),
              authorRole: data.comment.authorId?.currentJobTitle || data.comment.authorId?.title || data.comment.authorId?.role || data.comment.authorRole || user.currentJobTitle || user.title || (user.role === 'alumni' ? 'Alumni' : ''),
              content: data.comment.text || data.comment.content || ''
            }
          : null;
        
        // Update local state
        const updatePosts = (prev) => prev.map(p => {
          if (p._id === postId || p.id === postId) {
            const updatedComments = newComment ? [...(p.comments || []), newComment] : (p.comments || []);
            
            return {
              ...p,
              comments: updatedComments
            };
          }
          return p;
        });

        setPosts(updatePosts);
        setFilteredPosts(updatePosts);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // Save post
  const handleSavePost = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/save`);
      if (response.status === 200) {
        toast.success('Post saved!');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  // Share post
  const handleSharePost = async (postId) => {
    try {
      const post = posts.find(p => (p._id === postId || p.id === postId));
      if (!post) return;

      const postUrl = `${window.location.origin}/feed?post=${postId}`;
      const shareText = `Check out this post: "${(post.text || post.content || '').substring(0, 50)}..." on LDCE Aluverse!`;

      if (navigator.share) {
        navigator.share({
          title: 'Check out this post',
          text: shareText,
          url: postUrl
        });
      } else {
        // Fallback: Copy to clipboard and show modal
        navigator.clipboard.writeText(postUrl);
        toast.success('Post link copied to clipboard! You can share it now.');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const openImageLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setCurrentImageIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
    setLightboxImages([]);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImages.length]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('Image files selected:', files);
    if (files.length === 0) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      toast.error('No image files selected');
      return;
    }

    // Validate file sizes
    const MAX_SINGLE_IMAGE = 5 * 1024 * 1024; // 5MB per image
    const oversizedFiles = imageFiles.filter(f => f.size > MAX_SINGLE_IMAGE);
    
    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map(f => f.name).join(', ');
      const sizeMsg = oversizedFiles.map(f => `${(f.size / (1024 * 1024)).toFixed(2)}MB`).join(', ');
      toast.error(`Images too large: ${names}\nSizes: ${sizeMsg}\nMax: 5MB each. Will compress automatically.`);
    }

    const validFiles = imageFiles.slice(0, 10 - newPost.imageFiles.length);
    
    if (validFiles.length === 0) {
      toast.error('You can upload maximum 10 images');
      return;
    }

    const readers = validFiles.map(f => new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve({ dataUrl: r.result, file: f });
      r.readAsDataURL(f);
    }));

    Promise.all(readers).then((results) => {
      console.log('Image data URLs created:', results.length);
      setNewPost(prev => ({
        ...prev,
        images: [...(prev.images || []), ...results.map(r => r.dataUrl)].slice(0, 10),
        imageFiles: [...prev.imageFiles, ...results.map(r => r.file)].slice(0, 10),
        imagePreviews: [...(prev.imagePreviews || []), ...results.map(r => r.dataUrl)].slice(0, 10),
        video: null,
        videoFile: null,
        videoPreviews: null
      }));
      
      if (oversizedFiles.length > 0) {
        toast.info('Large images will be automatically compressed during upload');
      }
    });
  };
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    console.log('Video file selected:', file);
    if (!file) return;

    // Validate video format and size
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`Video too large: ${sizeMB}MB. Maximum is 25MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Video data URL created');
      setNewPost(prev => ({ ...prev, videoFile: file, video: reader.result, videoPreviews: reader.result, images: [], imageFiles: [], imagePreviews: [] }));
    };
    reader.onerror = () => {
      toast.error('Failed to read video file');
    };
    reader.readAsDataURL(file);
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    if (result.type === 'user') {
      // Navigate to user profile
      window.location.href = `/profile/${result.id}`;
    } else if (result.type === 'post') {
      // Scroll to post or highlight it
      const postElement = document.getElementById(`post-${result.id}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
        postElement.classList.add('ring-2', 'ring-purple-500');
        setTimeout(() => {
          postElement.classList.remove('ring-2', 'ring-purple-500');
        }, 2000);
      }
    }
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="w-full bg-[#f3f2ef]">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Center - Feed Content */}
        <div className="flex-1 max-w-xl mx-auto w-full">
          {/* Modern LinkedIn-Style Create Post Box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 transition-all hover:shadow-md group">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
                <AvatarImage src={getAvatarSrc(user)} alt={user?.displayName} />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                onClick={() => requireAuth() && setShowCreatePost(true)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 rounded-full px-5 py-3 text-slate-500 text-sm font-bold cursor-pointer transition-all border border-slate-200/50"
              >
                Start a post...
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
              <button
                onClick={() => { requireAuth(); setShowCreatePost(true); setTimeout(() => imageInputRef.current?.click(), 100); }}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <span className="text-slate-600 text-sm font-bold">Photo</span>
              </button>
              <button
                onClick={() => { requireAuth(); setShowCreatePost(true); setTimeout(() => videoInputRef.current?.click(), 100); }}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <Video className="h-5 w-5 text-red-500" />
                <span className="text-slate-600 text-sm font-bold">Video</span>
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-3 pb-20">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} id={`post-${post.id}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                  {/* LinkedIn Header */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Link to={`/profile/${post.authorId}`} className="shrink-0">
                        <Avatar className="h-12 w-12 border border-slate-100">
                          <AvatarImage src={post.authorPhoto} alt={post.authorName} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{post.authorName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/profile/${post.authorId}`} className="font-bold text-[15px] text-slate-900 hover:text-blue-600 hover:underline transition-colors truncate">
                            {post.authorName}
                          </Link>
                          {post.postType && (
                            <span className="text-[11px] font-black px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider whitespace-nowrap">
                              {post.postType === 'update' && '💬 Update'}
                              {post.postType === 'opportunity' && '💼 Opportunity'}
                              {post.postType === 'achievement' && '🏆 Achievement'}
                              {post.postType === 'mentorship' && '🎓 Mentorship'}
                              {post.postType === 'collaboration' && '🤝 Collaboration'}
                              {post.postType === 'resource' && '📚 Resource'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {user?.uid !== post.authorId && !connectedIds.has(post.authorId) && !pendingIds.has(post.authorId) && (
                            <button 
                              onClick={() => {
                                sendConnectionRequest(user, post.authorId);
                                setPendingIds(prev => new Set(prev).add(post.authorId));
                                toast.success('Connection request sent!');
                              }}
                              className="text-blue-600 hover:bg-blue-50 text-sm font-black px-2 py-0.5 rounded transition flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Connect
                            </button>
                          )}
                          {pendingIds.has(post.authorId) && (
                            <span className="text-slate-400 text-xs font-bold px-2 py-0.5 bg-slate-50 rounded">Pending</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-xs mt-1">
                          {post.authorRole || 'LDCE Alumnus'} {post.authorCompany && `at ${post.authorCompany}`}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-medium">{formatDistanceToNow(toJSDate(post.createdAt), { addSuffix: true })}</span>
                          <span className="text-slate-300">•</span>
                          <Globe className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {(() => {
                        const currentUserId = user?._id || user?.id || user?.uid;
                        const postAuthorId = post.authorId?._id || post.authorId || '';
                        return currentUserId && currentUserId === postAuthorId ? (
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors p-2 rounded-full"
                            title="Delete post"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* LinkedIn Content */}
                  <div className="px-4 pb-3">
                    <PostDescription content={post.text || post.content} />
                  </div>

                  {/* LinkedIn Media */}
                  <div className="relative border-y border-slate-100 bg-slate-50">
                    {Array.isArray(post.images) && post.images.length > 0 ? (
                      <div className={`grid gap-0.5 ${
                        post.images.length === 1 ? 'grid-cols-1' : 
                        post.images.length === 2 ? 'grid-cols-2' : 
                        'grid-cols-2'
                      }`}>
                        {post.images.slice(0, 4).map((src, idx) => (
                          <div 
                            key={idx} 
                            className={`relative overflow-hidden cursor-pointer group ${
                              post.images.length === 3 && idx === 0 ? 'row-span-2' : 'aspect-[4/3]'
                            }`}
                            onClick={() => openImageLightbox(post.images, idx)}
                          >
                            <img src={src} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 group-hover:brightness-75" onContextMenu={(e) => e.preventDefault()} />
                            {idx === 3 && post.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-2xl group-hover:bg-black/80 transition-all">
                                +{post.images.length - 4}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-white text-2xl font-bold">🔍 Click to view</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : post.image ? (
                      <img src={post.image} alt="Post" className="w-full max-h-[600px] object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => openImageLightbox([post.image], 0)} onContextMenu={(e) => e.preventDefault()} />
                    ) : post.video ? (
                      <div className="w-full aspect-video bg-black flex items-center" style={{position: 'relative'}}>
                        <style>{`
                          video::-webkit-media-controls-fullscreen-button { display: none; }
                          video::-webkit-media-controls-mute-button { display: none; }
                          video::-webkit-media-controls-toggle-closed-captions-button { display: none; }
                          video::-webkit-media-controls-overflow-menu-button { display: none; }
                          video::-moz-media-controls-fullscreen-button { display: none; }
                        `}</style>
                        <video src={post.video} controls className="w-full max-h-full" onContextMenu={(e) => e.preventDefault()} />
                      </div>
                    ) : null}
                  </div>

                  {/* LinkedIn Stats */}
                  {(post.likes?.length > 0 || post.comments?.length > 0) && (
                    <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <Heart className="h-2.5 w-2.5 text-white fill-current" />
                        </div>
                        <span className="text-[12px] text-slate-500 font-medium">
                          {post.likes?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => toggleComments(post.id)}
                          className="text-[12px] text-slate-500 hover:text-blue-600 hover:underline cursor-pointer font-medium"
                        >
                          {post.comments?.length || 0} comments
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Actions */}
                  <div className="px-2 py-1 flex items-center justify-between">
                    <button
                      onClick={() => handleLikePost(post._id || post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-100 transition-colors ${
                        post.likes?.includes(user?._id || user?.id || user?.uid) ? 'text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.likes?.includes(user?._id || user?.id || user?.uid) ? 'fill-current' : ''}`} />
                      <span className="text-sm font-bold">Like</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-100 transition-colors ${showComments[post.id] ? 'text-blue-600 bg-slate-50' : 'text-slate-600'}`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-bold">Comment</span>
                    </button>
                    <button
                      onClick={() => handleSharePost(post._id || post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-bold">Share</span>
                    </button>
                  </div>

                  {/* LinkedIn Comments Section - DROPDOWN */}
                  {showComments[post.id] && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-50">
                      {/* Add Comment */}
                      <div className="flex items-start space-x-2 mb-4 mt-2">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={getAvatarSrc(user)} alt={user?.displayName} />
                          <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                          <textarea
                            id={`comment-input-${post._id || post.id}`}
                            placeholder="Add a comment..."
                            value={commentInputs[post._id || post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id || post.id]: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[40px] max-h-[120px] resize-none transition-all placeholder:text-slate-400 font-medium"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post._id || post.id);
                              }
                            }}
                          />
                          <div className="flex justify-end mt-2">
                            {commentInputs[post._id || post.id]?.trim() && (
                              <button
                                onClick={() => handleAddComment(post._id || post.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold px-4 py-1.5 rounded-full transition-all"
                              >
                                Post
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-4">
                          {post.comments.map((comment) => {
                            // Use the pre-transformed data from the mapping function
                            const commenterName = comment.authorName || 'Alumni Member';
                            const commenterPhoto = comment.authorPhoto;
                            const commenterRole = comment.authorRole || '';
                            
                            // Fallback to extract ID differently if needed
                            const commenter = (typeof comment.authorId === 'object' && comment.authorId) || {};
                            const commenterId = comment.authorId?._id || commenter._id || comment.userId;

                            console.log('🎨 [Feed Render] Displaying comment:', {
                              commenterName,
                              commenterRole,
                              hasPhoto: Boolean(commenterPhoto),
                              commenterId
                            });

                            return (
                              <div key={comment.id || comment._id} className="flex items-start space-x-2 group">
                                <Link to={`/profile/${commenterId}`} className="shrink-0">
                                  <Avatar className="h-8 w-8 border border-slate-100">
                                    <AvatarImage src={commenterPhoto} alt={commenterName} />
                                    <AvatarFallback className="text-[10px] font-bold bg-blue-500 text-white">
                                      {commenterName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-slate-100 rounded-xl rounded-tl-none p-3 relative group">
                                    <div className="flex items-center justify-between">
                                      <Link to={`/profile/${commenterId}`} className="font-bold text-[13px] text-slate-900 hover:text-blue-600 hover:underline truncate">
                                        {commenterName}
                                      </Link>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {formatDistanceToNow(toJSDate(comment.createdAt), { addSuffix: true })}
                                      </span>
                                    </div>
                                    {commenterRole && (
                                      <p className="text-[10px] text-slate-500 font-medium leading-tight mb-1 truncate">
                                        {commenterRole}
                                      </p>
                                    )}
                                    <p className="text-[13px] text-slate-800 leading-normal mt-1 whitespace-pre-wrap">
                                      {comment.text || comment.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-xs text-slate-400 py-2">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No results found' : 'No posts yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? `Try searching for different keywords or alumni names`
                      : 'Be the first to share something with the community!'
                    }
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Create Post Modal Overlay */}
      {showCreatePost && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Inner white modal box - responsive and fits on screen */}
          <div 
            className="relative mx-auto bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
             <div 
               className="px-6 py-5 border-b border-slate-200 bg-white flex-shrink-0 flex items-center justify-between"
             >
               <h2 className="text-2xl font-bold text-slate-900">Create a post</h2>
               <button 
                 onClick={handleClose}
                 className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-4"
               >
                 <X className="w-6 h-6 text-slate-500 hover:text-slate-900" />
               </button>
             </div>
          
          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-white max-h-[calc(90vh-140px)]">
            {/* User Info */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
              <Avatar className="h-16 w-16 border-3 border-blue-100 shadow-md flex-shrink-0">
                <AvatarImage 
                  src={getAvatarSrc(user)} 
                  alt={user?.displayName}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{user?.displayName || 'LDCE Alumni'}</h4>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full w-fit hover:bg-slate-200 transition-colors cursor-pointer">
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-bold text-slate-700">Anyone</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-90" />
                </div>
              </div>
            </div>

            {/* Textarea - PRIMARY FOCUS - Made more prominent */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-600 block mb-2">WHAT DO YOU WANT TO SHARE? *</label>
              <textarea
                placeholder="Write your thoughts, updates, opportunities, achievements, or resources here..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                maxLength={5000}
                className="w-full min-h-[180px] text-base text-slate-900 placeholder:text-slate-400 border-2 border-blue-200 focus:border-blue-500 outline-none resize-none mb-2 font-medium bg-white p-4 rounded-xl transition-all focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{newPost.content.length} / 5000 characters</span>
                {!newPost.content.trim() && (
                  <span className="text-xs text-red-600 font-semibold">⚠️ Text is required</span>
                )}
              </div>
            </div>

            {/* Post Type Selection - Professional Types */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
              <label className="text-sm font-bold text-slate-800 block mb-3 flex items-center gap-2">
                <span>📌 CHOOSE POST TYPE:</span>
                <span className="text-xs font-normal text-slate-600">(Select what kind of post this is)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'update', label: '💬 Update', desc: 'Share thoughts, news, or latest info' },
                  { val: 'opportunity', label: '💼 Opportunity', desc: 'Job, internship, or project opening' },
                  { val: 'achievement', label: '🏆 Achievement', desc: 'Celebrate success or milestone' },
                  { val: 'mentorship', label: '🎓 Mentorship', desc: 'Offer or seek guidance' },
                  { val: 'collaboration', label: '🤝 Collaboration', desc: 'Find partners or team members' },
                  { val: 'resource', label: '📚 Resource', desc: 'Share knowledge or useful links' }
                ].map(type => (
                  <button
                    key={type.val}
                    onClick={() => setNewPost({ ...newPost, postType: type.val })}
                    className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 text-center ${
                      newPost.postType === type.val
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-300 scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-blue-400'
                    }`}
                    title={type.desc}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Preview - Image Grid (Simplified) */}
            {newPost.images.length > 0 && (
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">📸 PHOTOS ADDED: {newPost.images.length}</label>
                  {newPost.images.length > 0 && (
                    <button
                      onClick={() => setNewPost({ ...newPost, images: [], imageFiles: [], imagePreviews: [] })}
                      className="text-xs text-red-600 hover:text-red-700 font-bold"
                    >
                      Remove All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                  {newPost.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-slate-300 flex-shrink-0 bg-black/5 hover:border-blue-400 transition-all">
                      <img src={img} alt="" className="w-full h-full object-cover" onContextMenu={(e) => e.preventDefault()} />
                      <button
                        onClick={() => {
                          const newImgs = [...newPost.images];
                          const newFiles = [...newPost.imageFiles];
                          const newPreviews = [...(newPost.imagePreviews || [])];
                          newImgs.splice(idx, 1);
                          newFiles.splice(idx, 1);
                          newPreviews.splice(idx, 1);
                          setNewPost({ ...newPost, images: newImgs, imageFiles: newFiles, imagePreviews: newPreviews });
                        }}
                        className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-lg transition-all"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Preview (Simplified) */}
            {newPost.video && (
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-2">🎬 VIDEO ADDED</label>
                <div className="relative rounded-md overflow-hidden bg-black aspect-video group border border-slate-300">
                  <style>{`
                    video::-webkit-media-controls-fullscreen-button { display: none; }
                    video::-webkit-media-controls-mute-button { display: none; }
                    video::-webkit-media-controls-toggle-closed-captions-button { display: none; }
                    video::-webkit-media-controls-overflow-menu-button { display: none; }
                    video::-moz-media-controls-fullscreen-button { display: none; }
                  `}</style>
                  <video src={newPost.video} className="w-full h-full object-cover" controls onContextMenu={(e) => e.preventDefault()} />
                  <button
                    onClick={() => setNewPost({ ...newPost, video: null, videoFile: null })}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="border-t border-slate-200 bg-white px-6 py-4 flex-shrink-0">
            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            
            {/* Media Options */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-600">📎 OPTIONAL: Add Media -</span>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-all text-xs font-bold"
                  title="Add photos (up to 10)"
                >
                  <ImageIcon className="w-4 h-4" />
                  Photos
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition-all text-xs font-bold"
                  title="Add video (up to 1)"
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
              </div>
              
              <Button
                onClick={handleCreatePost}
                disabled={postCreationLoading || !newPost.content.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-2.5 rounded-full h-auto shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {postCreationLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </div>
                ) : '🚀 Post'}
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 font-medium text-center">
              ✓ Text is required • Photos and video are optional • Max 5000 characters
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}

      {/* Image Lightbox Modal */}
      {lightboxOpen && createPortal(
        <div 
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            title="Close (ESC)"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Main Image */}
          <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxImages[currentImageIndex]} 
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Navigation Arrows */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => { prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-3 transition-all hover:scale-110"
                  title="Previous (← Arrow)"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => { nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-3 transition-all hover:scale-110"
                  title="Next (→ Arrow)"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 rounded-full px-4 py-2 font-bold">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] p-2 bg-black/50 rounded-xl">
              {lightboxImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-16 w-16 object-cover rounded cursor-pointer transition-all ${
                    idx === currentImageIndex ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ))}
            </div>
          )}

          {/* Help Text */}
          <div className="absolute top-4 left-4 text-white/70 text-sm font-medium">
            <p>← → Navigate | ESC Close</p>
          </div>
        </div>,
        document.body
      )}
    </div>
);
};

export default FeedClean;
