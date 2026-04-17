import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import api from '@/services/axios';

const PostSimpleFixed = ({ post }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);

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

  const isOwner = !!user?.uid && ((post?.authorId === user.uid) || (post?.userId === user.uid));

  const handleDelete = async () => {
    if (!isOwner) return;
    const ok = window.confirm('Delete this post? This action cannot be undone.');
    if (!ok) return;
    setLoading(true);
    try {
      // Delete post via backend API
      await api.delete(`/posts/${post._id || post.id}`);
      toast.success('Post deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (post) {
      // Initialize likes and comments from post data
      setLikes(post.likes || []);
      setComments(post.comments || []);
      setLikeCount(post.likes?.length || 0);
      setCommentCount(post.comments?.length || 0);

      // Check if current user liked this post
      if (user && post.likes) {
        // post.likes may be an array of userIds or objects; support both
        const liked = Array.isArray(post.likes)
          ? post.likes.some(l => (typeof l === 'string' ? l === user.uid : l?.userId === user.uid))
          : false;
        setIsLiked(liked);
      }
    }
  }, [post, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setLoading(true);
    try {
      const newIsLiked = !isLiked;
      
      // Update via backend API
      if (newIsLiked) {
        await api.post(`/posts/${post._id || post.id}/like`);
      } else {
        await api.post(`/posts/${post._id || post.id}/unlike`);
      }
      
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
      toast.success(newIsLiked ? 'Post liked!' : 'Like removed');
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const commentData = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        content: newComment.trim(),
        createdAt: new Date(),
        likes: []
      };

      const newComments = [...comments, commentData];
      setComments(newComments);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      toast.success('Comment added!');

      // Save comment to Firebase
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        comments: newComments,
        commentCount: commentCount + 1,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.authorName}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
            <p className="text-xs text-gray-500">
              {post.authorRole} • {post.createdAt ? formatDistanceToNow(toJSDate(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-900 text-sm whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Media (carousel for multiple images) */}
      {Array.isArray(post.images) && post.images.length > 0 ? (
        <div className="mb-3 rounded-lg overflow-hidden relative bg-black">
          {(() => {
            const count = post.images.length;
            const safeIdx = ((idx % count) + count) % count;
            return (
              <>
                <img
                  src={post.images[safeIdx]}
                  alt={`Post image ${safeIdx + 1} of ${count}`}
                  className="w-full max-h-96 object-contain bg-black"
                />
                {count > 1 && (
                  <>
                    <button
                      onClick={() => setIdx((v) => v - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIdx((v) => v + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {post.images.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${i === safeIdx ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      ) : post.image ? (
        <div className="mb-3 rounded-lg overflow-hidden bg-black">
          <img
            src={post.image}
            alt="Post image"
            className="w-full max-h-96 object-contain bg-black"
          />
        </div>
      ) : post.video ? (
        <div className="mb-3 rounded-lg overflow-hidden bg-black">
          <video src={post.video} controls className="w-full max-h-96" />
        </div>
      ) : null}

      {/* Engagement Stats */}
      {(likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
          {likeCount > 0 && (
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          )}
          {commentCount > 0 && (
            <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
      )}

      {/* Engagement Buttons */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${isLiked
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-600 hover:bg-gray-100'
            } ${loading ? 'opacity-50' : ''}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{commentCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {isOwner && (
            <div className="flex justify-end pb-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
            </div>
          )}
          {/* Add Comment */}
          {user && (
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-2">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <img
                    src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 text-sm">{comment.userName || comment.authorName}</h4>
                      <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(toJSDate(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostSimpleFixed;
