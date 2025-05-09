import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  ChatIcon,
  ShareIcon,
  BookmarkIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/solid';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import ReactMarkdown from 'react-markdown';

const PostCard = ({ post, onPostUpdate }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Check if the current user has liked this post
  useEffect(() => {
    const checkIfLiked = async () => {
      if (currentUser && post.postId) {
        try {
          const postLikes = await api.getLikes(post.postId);
          const userLiked = postLikes.some(like => like.user.userId === currentUser.userId);
          setLiked(userLiked);
          setLikes(postLikes.length);
        } catch (error) {
          // Handle error
        }
      }
    };
    checkIfLiked();
  }, [currentUser, post.postId]);

  // Fetch comment count on mount
  useEffect(() => {
    const fetchCommentCount = async () => {
      if (post.postId) {
        try {
          const fetchedComments = await api.getComments(post.postId);
          setComments(fetchedComments);
        } catch (error) {}
      }
    };
    fetchCommentCount();
  }, [post.postId]);

  // Fetch comments when showing comments section
  useEffect(() => {
    const fetchComments = async () => {
      if (showComments && post.postId) {
        try {
          const fetchedComments = await api.getComments(post.postId);
          setComments(fetchedComments);
        } catch (error) {}
      }
    };
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.postId]);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      if (liked) {
        await api.unlikePost(post.postId, currentUser.userId);
        setLikes(likes - 1);
      } else {
        await api.likePost(post.postId, currentUser.userId);
        setLikes(likes + 1);
      }
      setLiked(!liked);
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      alert('Failed to process like. Please try again.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    setIsSubmittingComment(true);
    try {
      const newComment = {
        content: commentText,
        user: { userId: currentUser.userId },
        post: { postId: post.postId }
      };
      const createdComment = await api.createComment(newComment);
      setComments(prevComments => [...prevComments, createdComment]);
      setCommentText('');
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.content);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editCommentText.trim() || !editingComment) return;
    try {
      const updatedComment = { ...editingComment, content: editCommentText };
      const result = await api.updateComment(updatedComment);
      setComments(comments.map(c =>
        c.commentId === editingComment.commentId ? result : c
      ));
      setEditingComment(null);
      setEditCommentText('');
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      setComments(comments.filter(c => c.commentId !== commentId));
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      alert('Failed to delete comment. Please try again.');
    }
  };

  // UI data extraction
  const defaultAvatar = "/assets/images/default-avatar.png";
  const defaultDate = new Date().toLocaleDateString();
  const isBackendData = post.user && post.description;
  const authorName = isBackendData
    ? `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim()
    : (post.author ? post.author.name : 'Unknown User');
  const authorAvatar = isBackendData
    ? (post.user.profileImage || defaultAvatar)
    : (post.author ? post.author.avatar : defaultAvatar);
  const postContent = isBackendData ? post.description : post.content;
  const postTitle = isBackendData ? (post.title || '') : post.title;
  const postDate = isBackendData
    ? (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : defaultDate)
    : (post.createdAt || defaultDate);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-blue-100 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl group mb-8">
      {/* Decorative gradient */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-pink-400/10 rounded-full blur-2xl z-0 pointer-events-none"></div>
      <div className="p-6 relative z-10">
        <div className="flex items-center mb-4">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-12 w-12 rounded-full mr-4 object-cover border-2 border-blue-100 dark:border-blue-700 shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{authorName}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">{postDate}</p>
          </div>
        </div>
        {postTitle && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{postTitle}</h2>
        )}
        <ReactMarkdown
          components={{
            p: ({node, ...props}) => <p className="text-gray-700 dark:text-gray-300 mb-4" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />
          }}
        >
          {postContent}
        </ReactMarkdown>
        {(post.media1 || post.media2 || post.media3) && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[post.media1, post.media2, post.media3].map((media, idx) =>
              media ? (
                <div key={idx} className="rounded-xl overflow-hidden max-h-56 bg-white/40 dark:bg-slate-800/40 shadow">
                  {media.match(/\.(mp4|webm|ogg)$/) ? (
                    <video
                      src={media}
                      className="w-full h-auto object-cover max-h-56"
                      controls
                    />
                  ) : (
                    <img
                      src={media}
                      alt={`Post media ${idx + 1}`}
                      className="w-full h-auto object-contain max-h-56 cursor-pointer transition-transform hover:scale-105"
                      onClick={() => window.open(media, '_blank')}
                    />
                  )}
                </div>
              ) : null
            )}
          </div>
        )}
        {post.image && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={post.image}
              alt={postTitle || "Post image"}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center justify-between mt-2 text-gray-500 dark:text-gray-400">
          <div className="flex space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-150 hover:bg-blue-100/40 dark:hover:bg-blue-900/30 focus:outline-none ${liked ? 'text-pink-500 dark:text-pink-400' : ''}`}
            >
              {liked ? (
                <HeartIconSolid className="h-6 w-6" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
              <span className="font-semibold">{likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-150 hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 focus:outline-none"
            >
              <ChatIcon className="h-6 w-6" />
              <span className="font-semibold">{comments.length}</span>
            </button>
            <button className="flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-150 hover:bg-pink-100/40 dark:hover:bg-pink-900/30 focus:outline-none">
              <ShareIcon className="h-6 w-6" />
            </button>
          </div>
          <button className="flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-150 hover:bg-blue-100/40 dark:hover:bg-blue-900/30 focus:outline-none">
            <BookmarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-blue-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 rounded-b-3xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Comments</h3>
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.commentId || comment.id} className="flex items-start group">
                  <img
                    src={comment.user?.profileImage || (comment.author?.avatar) || defaultAvatar}
                    alt={comment.user?.firstName || comment.author?.name || "Commenter"}
                    className="h-9 w-9 rounded-full mr-3 object-cover border border-blue-100 dark:border-blue-700 shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                  {editingComment && editingComment.commentId === comment.commentId ? (
                    <div className="flex-1">
                      <form onSubmit={handleUpdateComment}>
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full border border-blue-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 focus:border-blue-400 dark:bg-slate-800 dark:text-white"
                          rows={2}
                          required
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingComment(null)}
                            className="px-3 py-1 text-xs bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {comment.user
                            ? `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim()
                            : (comment.author?.name || "Anonymous")}
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      {/* Comment actions */}
                      <div className="mt-1 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentUser && (comment.user?.userId === currentUser.userId) && (
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="p-1 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment.commentId)}
                          className="p-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No comments yet. Be the first to comment!
              </p>
            )}
            {currentUser && (
              <form onSubmit={handleAddComment} className="flex items-start mt-4">
                <img
                  src={currentUser.profileImage || defaultAvatar}
                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  className="h-9 w-9 rounded-full mr-3 object-cover border border-blue-100 dark:border-blue-700 shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full border border-blue-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 focus:border-blue-400 dark:bg-slate-800 dark:text-white"
                    rows={2}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="px-4 py-1 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes gradient {
          0%,100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PostCard;
