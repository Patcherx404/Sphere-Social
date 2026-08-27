import React, { useState } from 'react';
import { 
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, 
  ThumbsUp, Flame, Smile, ShieldCheck, Globe, Users, Lock, 
  MapPin, Send, Trash2, CheckCircle2, MessageCircle
} from 'lucide-react';
import { Post, ReactionType, User } from '../../types';
import { useSocial } from '../../context/SocialContext';
import confetti from 'canvas-confetti';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { 
    currentUser, 
    reactToPost, 
    addComment, 
    likeComment, 
    sharePost, 
    toggleSavePost, 
    votePoll, 
    deletePost,
    startDirectChat,
    setSelectedProfileUser 
  } = useSocial();

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const reactionEmojis: Record<ReactionType, { emoji: string; label: string; color: string }> = {
    like: { emoji: '👍', label: 'Like', color: 'text-[#3366FF]' },
    love: { emoji: '❤️', label: 'Love', color: 'text-[#FF3D71]' },
    care: { emoji: '🥰', label: 'Care', color: 'text-[#FFAB00]' },
    haha: { emoji: '😂', label: 'Haha', color: 'text-[#FFAB00]' },
    wow: { emoji: '😮', label: 'Wow', color: 'text-[#FFAB00]' },
    sad: { emoji: '😢', label: 'Sad', color: 'text-[#3366FF]' },
    fire: { emoji: '🔥', label: 'Fire', color: 'text-[#FF3D71]' }
  };

  const totalReactionsCount: number = (Object.values(post.reactions || {}) as number[]).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    sharePost(post.id);
    setShowShareNotification(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setShowShareNotification(false), 2500);
  };

  const handlePollVote = (optionId: string) => {
    votePoll(post.id, optionId);
  };

  const hasVotedInPoll = post.poll?.options.some(opt => opt.voters.includes(currentUser.id));

  return (
    <article className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-5 transition-all hover:border-slate-300">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setSelectedProfileUser(post.author)}
            className="cursor-pointer group relative"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            {post.author.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D68F] border-2 border-white rounded-full" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                onClick={() => setSelectedProfileUser(post.author)}
                className="font-bold text-sm text-slate-900 hover:text-[#FF3D71] cursor-pointer transition-colors"
              >
                {post.author.name}
              </span>
              {post.author.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#3366FF] flex-shrink-0" />
              )}
              {post.feeling && (
                <span className="text-xs text-slate-500 font-normal">
                  is {post.feeling.emoji} {post.feeling.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-medium">
              <span>{post.createdAt}</span>
              <span>•</span>
              {post.location && (
                <>
                  <span className="flex items-center gap-0.5 text-slate-600 font-semibold">
                    <MapPin className="w-3 h-3 text-[#FF3D71]" /> {post.location}
                  </span>
                  <span>•</span>
                </>
              )}
              <span title={post.audience}>
                {post.audience === 'public' && <Globe className="w-3 h-3 text-slate-400 inline" />}
                {post.audience === 'friends' && <Users className="w-3 h-3 text-slate-400 inline" />}
                {post.audience === 'only_me' && <Lock className="w-3 h-3 text-slate-400 inline" />}
              </span>
            </div>
          </div>
        </div>

        {/* Post Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F0F4F8] transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  toggleSavePost(post.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#F0F4F8] hover:text-[#FF3D71] transition-colors text-left cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#FFAB00]" />
                <span>{post.saved ? 'Remove Bookmark' : 'Save Post'}</span>
              </button>

              {post.author.id !== currentUser.id && (
                <button
                  onClick={() => {
                    startDirectChat(post.author);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#F0F4F8] hover:text-[#FF3D71] transition-colors text-left cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#3366FF]" />
                  <span>Send Direct Message</span>
                </button>
              )}

              {post.author.id === currentUser.id && (
                <button
                  onClick={() => {
                    deletePost(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#FF3D71] hover:bg-[#FFF0F4] transition-colors text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Text */}
      <div className="text-slate-800 text-sm sm:text-[15px] leading-relaxed mb-3 whitespace-pre-line font-normal">
        {post.content}
      </div>

      {/* Attached Image */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mb-3.5 border border-slate-200 bg-[#F7F9FC]">
          <img
            src={post.image}
            alt="Post media"
            className="w-full max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Interactive Poll */}
      {post.poll && (
        <div className="bg-[#F7F9FC] border border-slate-200/80 rounded-xl p-3.5 mb-3.5 space-y-2.5">
          <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
            <span>📊 {post.poll.question}</span>
            <span className="text-[11px] text-slate-500 font-semibold">{post.poll.totalVotes} total votes</span>
          </div>

          <div className="space-y-2">
            {post.poll.options.map(option => {
              const isVoted = option.voters.includes(currentUser.id);
              const percent = post.poll!.totalVotes > 0 
                ? Math.round((option.votes / post.poll!.totalVotes) * 100) 
                : 0;

              return (
                <button
                  key={option.id}
                  onClick={() => handlePollVote(option.id)}
                  disabled={hasVotedInPoll}
                  className={`w-full relative overflow-hidden rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                    isVoted 
                      ? 'border-[#3366FF] bg-[#3366FF]/10 text-slate-900 font-bold' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-[#F0F4F8]'
                  }`}
                >
                  {/* Progress Fill Bar */}
                  {hasVotedInPoll && (
                    <div 
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 rounded-l-xl ${
                        isVoted ? 'bg-[#3366FF]/20' : 'bg-slate-200/60'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold truncate pr-2">
                      {isVoted && <CheckCircle2 className="w-3.5 h-3.5 text-[#3366FF] flex-shrink-0" />}
                      {option.text}
                    </span>
                    {hasVotedInPoll && (
                      <span className="font-bold text-slate-800 flex-shrink-0">{percent}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reaction Summary Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-y border-slate-100 mb-1">
        <div className="flex items-center gap-1.5 font-medium">
          {totalReactionsCount > 0 && (
            <div className="flex items-center -space-x-1">
              {post.reactions.love > 0 && <span className="text-xs">❤️</span>}
              {post.reactions.fire > 0 && <span className="text-xs">🔥</span>}
              {post.reactions.like > 0 && <span className="text-xs">👍</span>}
              {post.reactions.wow > 0 && <span className="text-xs">😮</span>}
            </div>
          )}
          <span>{totalReactionsCount > 0 ? `${totalReactionsCount} reactions` : 'Be the first to react'}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline cursor-pointer">
            {post.comments.length} comments
          </button>
          <span>•</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Action Buttons & Hover Reactions Bar */}
      <div className="relative flex items-center justify-between pt-1">
        
        {/* Like Button with Hover Reactions Picker */}
        <div 
          className="relative flex-1"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-full px-2.5 py-1.5 shadow-xl flex items-center gap-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {(['like', 'love', 'fire', 'care', 'haha', 'wow', 'sad'] as ReactionType[]).map((type) => {
                const info = reactionEmojis[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      reactToPost(post.id, type);
                      setShowReactionPicker(false);
                    }}
                    className="text-lg hover:scale-135 transition-transform p-0.5 focus:outline-none cursor-pointer"
                    title={info.label}
                  >
                    {info.emoji}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => reactToPost(post.id, post.userReaction || 'like')}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              post.userReaction 
                ? `${reactionEmojis[post.userReaction].color} bg-[#FFF0F4]` 
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8]'
            }`}
          >
            {post.userReaction ? (
              <>
                <span className="text-sm">{reactionEmojis[post.userReaction].emoji}</span>
                <span>{reactionEmojis[post.userReaction].label}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8] transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Bookmark/Save */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            post.saved 
              ? 'text-[#FFAB00] bg-[#FFF8E6]' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8]'
          }`}
          title={post.saved ? 'Saved' : 'Save'}
        >
          <Bookmark className={`w-4 h-4 ${post.saved ? 'fill-[#FFAB00]' : ''}`} />
        </button>
      </div>

      {showShareNotification && (
        <div className="mt-2 py-1.5 px-3 bg-[#E6FBF4] border border-[#00D68F]/40 rounded-xl text-[#008f5e] text-xs text-center font-bold animate-in fade-in">
          ✓ Post shared to your Sphere network!
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          
          {/* Add Comment Field */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 bg-[#F7F9FC] border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-[#FF3D71] hover:text-[#d92356] disabled:opacity-30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          {post.comments.length > 0 && (
            <div className="space-y-2.5 pt-1">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-2.5 group">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    onClick={() => setSelectedProfileUser(comment.author)}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5 cursor-pointer flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-[#F7F9FC] border border-slate-200/80 rounded-2xl px-3 py-2 inline-block max-w-full">
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => setSelectedProfileUser(comment.author)}
                          className="font-bold text-xs text-slate-900 hover:text-[#FF3D71] cursor-pointer"
                        >
                          {comment.author.name}
                        </span>
                        {comment.author.verified && (
                          <ShieldCheck className="w-3 h-3 text-[#3366FF]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed break-words font-normal">
                        {comment.content}
                      </p>
                    </div>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-3 mt-1 ml-2 text-[10px] text-slate-400 font-medium">
                      <span>{comment.createdAt}</span>
                      <button
                        onClick={() => likeComment(post.id, comment.id)}
                        className={`font-bold hover:underline cursor-pointer ${
                          comment.userLiked ? 'text-[#FF3D71]' : 'hover:text-slate-700'
                        }`}
                      >
                        Like {comment.likesCount > 0 ? `(${comment.likesCount})` : ''}
                      </button>
                      <button 
                        onClick={() => {
                          setCommentText(`@${comment.author.name} `);
                        }}
                        className="hover:underline hover:text-slate-700 cursor-pointer font-medium"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </article>
  );
};
