import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Minus, Maximize2, Phone, Video, Image, Smile, Mic, 
  Send, CheckCheck, Play, Pause, Trash2, Heart, ThumbsUp, Flame,
  EyeOff, ShieldCheck, Lock
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
    setActiveConversationId
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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showSecretDeleteConfirm, setShowSecretDeleteConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMinimized = minimizedChats[conversationId];

  const otherUserRaw = conversation?.isGroup 
    ? null 
    : conversation?.participants.find(p => p.id !== currentUser?.id) || conversation?.participants[0];

  const otherUser = otherUserRaw ? (users.find(u => u.id === otherUserRaw.id) || otherUserRaw) : null;

  const title = conversation?.isGroup ? conversation.name : otherUser?.name || 'Chat';
  const avatar = conversation?.isGroup ? conversation.avatar : otherUser?.avatar;
  const isOnline = otherUser?.isOnline;

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
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    sendMessage(conversationId, {
      text: '🎵 Voice message',
      mediaType: 'audio',
      audioDuration: Math.max(3, recordSeconds)
    });
  };

  if (isMinimized) {
    return (
      <div 
        onClick={() => toggleMinimizeChat(conversationId)}
        className="relative group cursor-pointer"
        title={`Chat with ${title}`}
      >
        <div className="w-13 h-13 rounded-full bg-white border-2 border-[#FF3D71] shadow-xl overflow-hidden hover:scale-110 transition-transform">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00D68F] border-2 border-white rounded-full" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeFloatingChat(conversationId);
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-white text-slate-500 hover:text-slate-900 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 shadow-xs cursor-pointer"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-88 h-[440px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-150">
      
      {/* Window Header */}
      <div className="px-3.5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
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
            className="p-1 rounded-lg hover:text-red-600 hover:bg-red-50 cursor-pointer"
            title="Delete Conversation Secretly (Only for me)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => startCall(conversationId, false)}
            className="p-1 rounded-lg hover:text-slate-800 hover:bg-[#F7F9FC] cursor-pointer"
            title="Start Audio Call"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => {
              setActiveTab('messenger');
              setActiveConversationId(conversationId);
            }}
            className="p-1 rounded-lg hover:text-slate-800 hover:bg-[#F7F9FC] cursor-pointer"
            title="Expand to Full Messenger"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => toggleMinimizeChat(conversationId)}
            className="p-1 rounded-lg hover:text-slate-800 hover:bg-[#F7F9FC] cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => closeFloatingChat(conversationId)}
            className="p-1 rounded-lg hover:text-[#FF3D71] hover:bg-[#FFF0F4] cursor-pointer"
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
              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSecretDelete}
              className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
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
            <p className="text-xs font-semibold">Say hello to start the conversation 👋</p>
          </div>
        ) : (
          convMessages.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            const isAudio = msg.mediaType === 'audio';

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-end gap-1.5 max-w-[85%]">
                  {!isMe && (
                    <img
                      src={conversation.participants.find(p => p.id === msg.senderId)?.avatar || otherUser?.avatar}
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
        /* Standard Message Input Bar */
        <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowImagePicker(!showImagePicker)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00D68F] hover:bg-[#F7F9FC] cursor-pointer"
            title="Attach Photo"
          >
            <Image className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsRecordingVoice(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF3D71] hover:bg-[#F7F9FC] cursor-pointer"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[#F7F9FC] border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() && !imageUrl}
            className="p-2 bg-[#FF3D71] hover:bg-[#e03161] disabled:opacity-30 text-white rounded-full transition-colors flex-shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

    </div>
  );
};
