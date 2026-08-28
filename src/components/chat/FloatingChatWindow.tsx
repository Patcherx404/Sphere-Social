import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Minus, Maximize2, Phone, Video, Image, Smile, Mic, 
  Send, CheckCheck, Play, Pause, Trash2, Heart, ThumbsUp, Flame,
  EyeOff, MessageSquare, Sparkles, CornerDownRight
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { Conversation, ChatMessage } from '../../types';

interface FloatingChatWindowProps {
  conversationId: string;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({ conversationId }) => {
  const { 
    currentUser, 
    users,
    conversations, 
    messages, 
    sendMessage, 
    reactToMessage, 
    deleteConversationSecretly,
    closeFloatingChat, 
    toggleMinimizeChat, 
    minimizedChats,
    startCall,
    setActiveTab,
    setActiveConversationId,
    latestPopupMessage,
    dismissLatestPopupMessage
  } = useSocial();

  const conversation = conversations.find(c => c.id === conversationId);
  const clearTimestamp = (currentUser && conversation?.clearedAtForUsers?.[currentUser.id]) || 0;
  const rawMessages = messages[conversationId] || [];
  const convMessages = rawMessages.filter(m => {
    if (!clearTimestamp) return true;
    const msgTs = typeof m.timestamp === 'number' && !isNaN(m.timestamp) ? m.timestamp : 0;
    return msgTs >= clearTimestamp;
  });

  const [inputVal, setInputVal] = useState('');
  const [quickReplyVal, setQuickReplyVal] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showSecretDeleteConfirm, setShowSecretDeleteConfirm] = useState(false);
  const [showBubbleToast, setShowBubbleToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const isMinimized = minimizedChats[conversationId];

  const getParticipantIds = (c?: Conversation | null): string[] => {
    if (!c) return [];
    if (Array.isArray(c.participantIds) && c.participantIds.length > 0) return c.participantIds;
    if (Array.isArray(c.participants) && c.participants.length > 0) return c.participants.map(p => p?.id).filter(Boolean);
    return [];
  };

  const getResolvedParticipants = (c?: Conversation | null): any[] => {
    if (!c) return [];
    const pIds = getParticipantIds(c);
    if (pIds.length > 0) {
      return pIds.map(id => {
        const u = users.find(user => user.id === id);
        if (u) return u;
        const cached = c.participants?.find(p => p?.id === id);
        if (cached) return cached;
        return {
          id,
          name: 'Sphere Member',
          handle: id.slice(0, 8),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          coverPhoto: '',
          bio: '',
          joinedDate: '',
          isOnline: false,
          friendsCount: 0,
          followersCount: 0
        };
      });
    }
    return Array.isArray(c.participants) ? c.participants : [];
  };

  const resolvedParticipants = getResolvedParticipants(conversation);
  const otherUser = conversation?.isGroup 
    ? null 
    : resolvedParticipants.find(p => p.id !== currentUser?.id) || resolvedParticipants[0] || null;

  const title = conversation?.isGroup ? (conversation.name || 'Group Chat') : otherUser?.name || 'Chat';
  const avatar = conversation?.isGroup ? conversation.avatar : otherUser?.avatar;
  const isOnline = otherUser?.isOnline;

  // Unread messages count for this conversation
  const unreadCount = convMessages.filter(m => !m.read && m.senderId !== currentUser?.id).length;

  // Auto-show bubble popup when an incoming message is received for this conversation
  useEffect(() => {
    if (latestPopupMessage && latestPopupMessage.conversationId === conversationId) {
      setShowBubbleToast(true);
      const timer = setTimeout(() => {
        setShowBubbleToast(false);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [latestPopupMessage, conversationId]);

  // Auto-focus input whenever the chat window is expanded
  useEffect(() => {
    if (!isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  // Voice recording timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setRecordSeconds(p => p + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  if (!conversation) {
    return null;
  }

  const handleSecretDelete = () => {
    deleteConversationSecretly(conversationId);
    closeFloatingChat(conversationId);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() && !imageUrl) return;

    sendMessage(conversationId, {
      text: inputVal.trim() || undefined,
      mediaUrl: imageUrl.trim() || undefined,
      mediaType: imageUrl ? 'image' : undefined
    });

    setInputVal('');
    setImageUrl('');
    setShowImagePicker(false);
    setShowEmojiPicker(false);
  };

  const handleQuickReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyVal.trim()) return;

    sendMessage(conversationId, {
      text: quickReplyVal.trim()
    });

    setQuickReplyVal('');
    setShowBubbleToast(false);
    dismissLatestPopupMessage();
  };

  const handleQuickEmoji = (emoji: string) => {
    sendMessage(conversationId, {
      text: emoji
    });
    setShowBubbleToast(false);
    dismissLatestPopupMessage();
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    sendMessage(conversationId, {
      text: '🎵 Voice message',
      mediaType: 'audio',
      audioDuration: Math.max(3, recordSeconds)
    });
  };

  const lastMsg = convMessages[convMessages.length - 1];
  const lastMsgSnippet = lastMsg 
    ? (lastMsg.text || (lastMsg.mediaType === 'audio' ? '🎵 Voice note' : '📷 Photo')) 
    : 'New message';

  // ==========================================
  // 1. MINIMIZED: CHAT HEAD WITH AUTO POPUP BUBBLE
  // ==========================================
  if (isMinimized) {
    return (
      <div className="relative flex items-end justify-end pointer-events-auto select-none">
        
        {/* Auto Popup Speech Bubble Toast for Easy 1-Tap Reply */}
        {(showBubbleToast || (latestPopupMessage?.conversationId === conversationId)) && (
          <div 
            id={`popup-bubble-${conversationId}`}
            className="absolute bottom-16 right-0 sm:right-1 mb-1 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-3 z-50 animate-in slide-in-from-bottom-3 fade-in duration-200"
          >
            {/* Header with Sender info */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={title}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-slate-900 truncate">{title}</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubbleToast(false);
                  dismissLatestPopupMessage();
                }}
                className="w-5 h-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Message Body Preview */}
            <div 
              onClick={() => {
                toggleMinimizeChat(conversationId);
                setShowBubbleToast(false);
                dismissLatestPopupMessage();
              }}
              className="py-2 cursor-pointer group"
            >
              <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed group-hover:text-slate-900">
                "{lastMsgSnippet}"
              </p>
            </div>

            {/* Quick Emoji Reaction Buttons */}
            <div className="flex items-center justify-between gap-1 py-1 mb-2">
              <div className="flex items-center gap-1">
                {['❤️', '👍', '🔥', '😂', '🙌'].map(em => (
                  <button
                    key={em}
                    onClick={() => handleQuickEmoji(em)}
                    className="px-1.5 py-0.5 text-xs hover:scale-125 hover:bg-slate-50 rounded-md transition-all cursor-pointer"
                    title={`Send ${em}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  toggleMinimizeChat(conversationId);
                  setShowBubbleToast(false);
                  dismissLatestPopupMessage();
                }}
                className="text-[11px] font-bold text-[#FF3D71] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Chat</span>
                <CornerDownRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Inline Reply Input */}
            <form onSubmit={handleQuickReplySubmit} className="flex items-center gap-1.5 pt-1">
              <input
                ref={quickInputRef}
                type="text"
                value={quickReplyVal}
                onChange={(e) => setQuickReplyVal(e.target.value)}
                placeholder="Type quick reply..."
                className="flex-1 px-3 py-1.5 bg-[#F7F9FC] border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={!quickReplyVal.trim()}
                className="p-1.5 bg-[#FF3D71] hover:bg-[#e03161] disabled:opacity-30 text-white rounded-full transition-colors cursor-pointer flex-shrink-0 shadow-xs"
                title="Send reply"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}

        {/* The Circular Floating Chat Head */}
        <div 
          id={`chat-head-${conversationId}`}
          onClick={() => {
            toggleMinimizeChat(conversationId);
            setShowBubbleToast(false);
            dismissLatestPopupMessage();
          }}
          className="relative group cursor-pointer"
          title={`Chat with ${title}`}
        >
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white ring-2 ring-[#FF3D71] ring-offset-2 shadow-xl overflow-hidden hover:scale-105 active:scale-95 transition-all">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Online status green dot */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00D68F] border-2 border-white rounded-full ring-1 ring-slate-100" />
          )}

          {/* Unread badge pill */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 px-1.5 py-0.5 min-w-5 h-5 bg-[#FF3D71] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Close Head button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFloatingChat(conversationId);
              setShowBubbleToast(false);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-white text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 shadow-md cursor-pointer"
            title="Dismiss Chat Head"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. EXPANDED: FLOATING CHAT WINDOW
  // ==========================================
  return (
    <div 
      id={`floating-window-${conversationId}`}
      className="w-[calc(100vw-1.5rem)] sm:w-88 max-w-sm h-[420px] sm:h-[460px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-150 pointer-events-auto"
    >
      
      {/* Window Header */}
      <div className="px-3.5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div 
          onClick={() => {
            setActiveTab('messenger');
            setActiveConversationId(conversationId);
          }}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="relative flex-shrink-0">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={title}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D68F] border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
            <span className="text-[10px] text-slate-400 block truncate font-medium">
              {conversation.typingUsers && conversation.typingUsers.length > 0 ? (
                <span className="text-[#FF3D71] font-semibold animate-pulse">Typing...</span>
              ) : isOnline ? (
                'Active now'
              ) : (
                'Offline'
              )}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-0.5 text-slate-400">
          <button
            onClick={() => setShowSecretDeleteConfirm(true)}
            className="p-1.5 rounded-lg hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
            title="Delete Conversation Secretly (Only for me)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => startCall(conversationId, false)}
            className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-[#F7F9FC] cursor-pointer transition-colors"
            title="Start Audio Call"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => {
              setActiveTab('messenger');
              setActiveConversationId(conversationId);
            }}
            className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-[#F7F9FC] cursor-pointer transition-colors"
            title="Expand to Full Messenger"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => toggleMinimizeChat(conversationId)}
            className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-[#F7F9FC] cursor-pointer transition-colors"
            title="Minimize to Chat Head"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => closeFloatingChat(conversationId)}
            className="p-1.5 rounded-lg hover:text-[#FF3D71] hover:bg-[#FFF0F4] cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secret Delete Overlay Confirmation */}
      {showSecretDeleteConfirm && (
        <div className="p-3 bg-red-50 border-b border-red-100 animate-in fade-in flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-red-800">
            <div className="flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-red-600" />
              <span>Delete Secretly?</span>
            </div>
            <button onClick={() => setShowSecretDeleteConfirm(false)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          <p className="text-[11px] text-red-700/90 leading-tight">
            Removes this chat from your inbox only. The other person keeps their history.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowSecretDeleteConfirm(false)}
              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSecretDelete}
              className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#F7F9FC]">
        {convMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-xs">
              <MessageSquare className="w-5 h-5 text-[#FF3D71]" />
            </div>
            <p className="text-xs font-semibold text-slate-600">Say hello to {title}! 👋</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Send a quick message below</p>
          </div>
        ) : (
          convMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            const isAudio = msg.mediaType === 'audio';

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-end gap-1.5 max-w-[85%]">
                    {!isMe && (
                    <img
                      src={resolvedParticipants.find(p => p.id === msg.senderId)?.avatar || otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 mb-1"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div className="space-y-1">
                    {/* Image Message */}
                    {msg.mediaUrl && (
                      <div className="rounded-xl overflow-hidden max-h-40 border border-slate-200 bg-white shadow-xs">
                        <img src={msg.mediaUrl} alt="Attached" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Audio Voice Note Bubble */}
                    {isAudio ? (
                      <div className={`flex items-center gap-2 p-2 rounded-2xl shadow-xs ${
                        isMe ? 'bg-[#FF3D71] text-white' : 'bg-white text-slate-800 border border-slate-200'
                      }`}>
                        <button
                          onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 cursor-pointer"
                        >
                          {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <div className="flex items-center gap-1">
                          {[30, 60, 90, 40, 80, 50, 70, 40, 60].map((h, idx) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-full ${playingAudioId === msg.id ? 'bg-white animate-pulse' : (isMe ? 'bg-white/60' : 'bg-slate-300')}`}
                              style={{ height: `${(h / 100) * 16}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] opacity-80 font-mono ml-1">
                          0:{msg.audioDuration ? msg.audioDuration.toString().padStart(2, '0') : '05'}
                        </span>
                      </div>
                    ) : (
                      /* Text Message Bubble */
                      msg.text && (
                        <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                          isMe 
                            ? 'bg-[#FF3D71] text-white rounded-br-xs' 
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}>
                          {msg.text}
                        </div>
                      )
                    )}

                    {/* Emoji Reactions on Message */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {msg.reactions.map((r, i) => (
                          <span key={i} className="text-[11px] px-1.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs">
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & Quick Reaction hover buttons */}
                <div className={`flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isMe ? 'pr-1' : 'pl-7'
                }`}>
                  <span>{msg.createdAt}</span>
                  {!isMe && (
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => reactToMessage(conversationId, msg.id, '❤️')} className="hover:scale-125 transition-transform cursor-pointer">❤️</button>
                      <button onClick={() => reactToMessage(conversationId, msg.id, '👍')} className="hover:scale-125 transition-transform cursor-pointer">👍</button>
                      <button onClick={() => reactToMessage(conversationId, msg.id, '🔥')} className="hover:scale-125 transition-transform cursor-pointer">🔥</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {conversation.typingUsers && conversation.typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#FF3D71] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#FF3D71] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#FF3D71] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">typing a message...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="p-2 bg-white border-t border-slate-200 animate-in fade-in flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['❤️', '👍', '🔥', '😂', '😍', '🎉', '🚀', '👏', '🥳', '🙌', '✨', '💯'].map(em => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  setInputVal(prev => prev + em);
                  setShowEmojiPicker(false);
                  inputRef.current?.focus();
                }}
                className="text-base p-1 hover:scale-125 transition-transform cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>
          <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer">✕</button>
        </div>
      )}

      {/* Image Attachment Picker Popover */}
      {showImagePicker && (
        <div className="p-2 bg-white border-t border-slate-200 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span>Attach Image</span>
            <button onClick={() => setShowImagePicker(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
          </div>
          <input
            type="url"
            placeholder="Paste image link (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-2.5 py-1 bg-[#F7F9FC] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71]"
          />
        </div>
      )}

      {/* Voice Recording Active Mode */}
      {isRecordingVoice ? (
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3D71] animate-ping" />
            <span className="text-xs font-bold text-[#FF3D71]">
              Recording 0:{recordSeconds.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRecordingVoice(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF3D71] hover:bg-[#FFF0F4] cursor-pointer"
              title="Cancel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="px-3 py-1 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Send Voice
            </button>
          </div>
        </div>
      ) : (
        /* Standard Message Input Bar with Autofocus */
        <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowImagePicker(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-[#F7F9FC] cursor-pointer transition-colors"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowImagePicker(!showImagePicker);
              setShowEmojiPicker(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00D68F] hover:bg-[#F7F9FC] cursor-pointer transition-colors"
            title="Attach Photo"
          >
            <Image className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsRecordingVoice(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF3D71] hover:bg-[#F7F9FC] cursor-pointer transition-colors"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[#F7F9FC] border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() && !imageUrl}
            className="p-2 bg-[#FF3D71] hover:bg-[#e03161] disabled:opacity-30 text-white rounded-full transition-colors flex-shrink-0 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

    </div>
  );
};
