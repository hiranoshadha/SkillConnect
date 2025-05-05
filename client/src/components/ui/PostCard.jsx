import React, { useState, useEffect } from 'react';
import { HeartIcon, ChatIcon, ShareIcon, BookmarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/outline';
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
    console.log(post)
    const checkIfLiked = async () => {
      if (currentUser && post.postId) {
        try {
          const postLikes = await api.getLikes(post.postId);
          const userLiked = postLikes.some(like => like.user.userId === currentUser.userId);
          setLiked(userLiked);
          setLikes(postLikes.length);
        } catch (error) {
          console.error('Error checking likes:', error);
        }
      }
    };

    checkIfLiked();
  }, [currentUser, post.postId]);

  // Add this useEffect to fetch comment count on component mount
  useEffect(() => {
    const fetchCommentCount = async () => {
      if (post.postId) {
        try {
          const fetchedComments = await api.getComments(post.postId);
          setComments(fetchedComments);
        } catch (error) {
          console.error('Error fetching comment count:', error);
        }
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
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
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

      // Notify parent component about the update
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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
        user: {
          userId: currentUser.userId
        },
        post: {
          postId: post.postId
        }
      };


      const createdComment = await api.createComment(newComment);

      // Add the new comment to the list
      setComments(prevComments => [...prevComments, createdComment]);
      setCommentText('');

      // Notify parent component about the update
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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
      const updatedComment = {
        ...editingComment,
        content: editCommentText
      };

      const result = await api.updateComment(updatedComment);

      // Update the comment in the list
      setComments(comments.map(c =>
        c.commentId === editingComment.commentId ? result : c
      ));

      // Reset editing state
      setEditingComment(null);
      setEditCommentText('');

      // Notify parent component about the update
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.deleteComment(commentId);

      // Remove the comment from the list
      setComments(comments.filter(c => c.commentId !== commentId));

      // Notify parent component about the update
      if (onPostUpdate) {
        onPostUpdate(post.postId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Default values
  const defaultAvatar = "/assets/images/default-avatar.png";
  const defaultDate = new Date().toLocaleDateString();

  // Check if we're dealing with the backend API structure or the frontend dummy data structure
  const isBackendData = post.user && post.description;

  // Extract data based on the structure
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-10 w-10 rounded-full mr-3 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{authorName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{postDate}</p>
          </div>
        </div>

        {postTitle && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{postTitle}</h2>
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
            {post.media1 && (
              <div className="rounded-lg overflow-hidden max-h-64">
                {post.media1.includes('.mp4') || post.media1.includes('.webm') || post.media1.includes('.ogg') ? (
                  <video
                    src={post.media1}
                    className="w-full h-auto object-cover max-h-64"
                    controls
                  />
                ) : (
                  <img
                    src={post.media1}
                    alt="Post media 1"
                    className="w-full h-auto object-contain max-h-64"
                    onClick={() => window.open(post.media1, '_blank')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
            )}

            {post.media2 && (
              <div className="rounded-lg overflow-hidden max-h-64">
                {post.media2.includes('.mp4') || post.media2.includes('.webm') || post.media2.includes('.ogg') ? (
                  <video
                    src={post.media2}
                    className="w-full h-auto object-cover max-h-64"
                    controls
                  />
                ) : (
                  <img
                    src={post.media2}
                    alt="Post media 2"
                    className="w-full h-auto object-contain max-h-64"
                    onClick={() => window.open(post.media2, '_blank')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
            )}

            {post.media3 && (
              <div className="rounded-lg overflow-hidden max-h-64">
                {post.media3.includes('.mp4') || post.media3.includes('.webm') || post.media3.includes('.ogg') ? (
                  <video
                    src={post.media3}
                    className="w-full h-auto object-cover max-h-64"
                    controls
                  />
                ) : (
                  <img
                    src={post.media3}
                    alt="Post media 3"
                    className="w-full h-auto object-contain max-h-64"
                    onClick={() => window.open(post.media3, '_blank')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={postTitle || "Post image"}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${liked ? 'text-red-500 dark:text-red-400' : ''}`}
            >
              {liked ? (
                <HeartIconSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span>{likes}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1"
            >
              <ChatIcon className="h-5 w-5" />
              <span>{comments.length}</span>
            </button>

            <button className="flex items-center space-x-1">
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>

          <button className="flex items-center space-x-1">
            <BookmarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Comments</h3>
          <div className="space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.commentId || comment.id} className="flex items-start group">
                  <img
                    src={comment.user?.profileImage || (comment.author?.avatar) || defaultAvatar}
                    alt={comment.user?.firstName || comment.author?.name || "Commenter"}
                    className="h-8 w-8 rounded-full mr-2 object-cover"
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
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                          rows={2}
                          required
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingComment(null)}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
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
                    <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.user
                            ? `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim()
                            : (comment.author?.name || "Anonymous")}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>

                      {/* Comment actions - only show for the comment author */}
                      
                        <div className="mt-1 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentUser && (comment.user?.userId === currentUser.userId) && (
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="p-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.commentId)}
                            className="p-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-3 w-3" />
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
                  className="h-8 w-8 rounded-full mr-2 object-cover"
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
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={2}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default PostCard;
