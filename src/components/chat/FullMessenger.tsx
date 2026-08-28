import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Phone, Video, Info, Image, Smile, Mic, Send, 
  MoreVertical, CheckCheck, Play, Pause, Plus, Users, 
  Trash2, ShieldCheck, Heart, ThumbsUp, Flame, ChevronRight, X,
  EyeOff, Lock, AlertTriangle
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { Conversation, ChatMessage, User } from '../../types';

export const FullMessenger: React.FC = () => {
  const { 
    currentUser, 
    users,
    conversations, 
    messages, 
    activeConversationId, 
    setActiveConversationId, 
    sendMessage, 
    reactToMessage, 
    deleteConversationSecretly,
    startDirectChat,
    createGroupChat,
    startCall,
    setSelectedProfileUser 
  } = useSocial();

  const [searchFilter, setSearchFilter] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userPickerSearch, setUserPickerSearch] = useState('');
  const [secretDeleteTargetConv, setSecretDeleteTargetConv] = useState<Conversation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(c => {
    if (!currentUser) return false;
    if (c.deletedForUserIds?.includes(currentUser.id)) return false;
    if (c.participantIds && c.participantIds.length > 0 && !c.participantIds.includes(currentUser.id)) {
      return false;
    }
    if (!searchFilter.trim()) return true;
    const searchLower = searchFilter.toLowerCase();
    if (c.isGroup) {
      return c.name?.toLowerCase().includes(searchLower);
    }
    const other = c.participants.find(p => p.id !== currentUser?.id);
    const resolvedOther = other ? (users.find(u => u.id === other.id) || other) : null;
    return resolvedOther?.name.toLowerCase().includes(searchLower) || resolvedOther?.handle.toLowerCase().includes(searchLower);
  });

  // Set default active conversation if none selected
  const activeId = activeConversationId || (filteredConversations.length > 0 ? filteredConversations[0].id : null);
  const activeConversation = conversations.find(c => c.id === activeId);

  const clearTimestamp = (currentUser && activeConversation?.clearedAtForUsers?.[currentUser.id]) || 0;
  const rawMessages = activeId ? messages[activeId] || [] : [];
  const currentMessages = rawMessages.filter(m => (m.timestamp || 0) >= clearTimestamp);

  const getResolvedParticipant = (p: User) => {
    return users.find(u => u.id === p.id) || p;
  };

  const otherUserRaw = activeConversation?.isGroup 
    ? null 
    : activeConversation?.participants.find(p => p.id !== currentUser?.id) || activeConversation?.participants[0];
  const otherUser = otherUserRaw ? getResolvedParticipant(otherUserRaw) : null;

  const title = activeConversation?.isGroup ? activeConversation.name : otherUser?.name || 'Messenger';
  const avatar = activeConversation?.isGroup ? activeConversation.avatar : otherUser?.avatar;
  const isOnline = otherUser?.isOnline;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeId]);

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

  const handleConfirmSecretDelete = () => {
    if (!secretDeleteTargetConv) return;
    deleteConversationSecretly(secretDeleteTargetConv.id);
    if (activeId === secretDeleteTargetConv.id) {
      setActiveConversationId(null);
    }
    setSecretDeleteTargetConv(null);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeId || (!inputVal.trim() && !imageUrl)) return;

    sendMessage(activeId, {
      text: inputVal.trim() || undefined,
      mediaUrl: imageUrl.trim() || undefined,
      mediaType: imageUrl ? 'image' : undefined
    });

    setInputVal('');
    setImageUrl('');
    setShowImagePicker(false);
  };

  const handleSendVoiceNote = () => {
    if (!activeId) return;
    setIsRecordingVoice(false);
    sendMessage(activeId, {
      text: '🎵 Audio message',
      mediaType: 'audio',
      audioDuration: Math.max(3, recordSeconds)
    });
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;
    const newId = createGroupChat(groupName.trim(), selectedGroupMembers);
    setActiveConversationId(newId);
    setGroupName('');
    setSelectedGroupMembers([]);
    setIsNewGroupModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-5rem)] max-w-7xl mx-auto bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl flex">
      
      {/* Left Sidebar: Conversations List */}
      <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col bg-white">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">Messages</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setUserPickerSearch('');
                  setIsNewChatModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFF0F4] hover:bg-[#ffe2e9] text-[#FF3D71] text-xs font-bold transition-colors cursor-pointer"
                title="Direct Message"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setIsNewGroupModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F0F4F8] hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Create Group"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Group</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const other = conv.isGroup 
                ? null 
                : conv.participants.find(p => p.id !== currentUser.id) || conv.participants[0];
              const convTitle = conv.isGroup ? conv.name : other?.name;
              const convAvatar = conv.isGroup ? conv.avatar : other?.avatar;
              const isSelected = conv.id === activeId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`group/conv flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all relative ${
                    isSelected 
                      ? 'bg-[#FFF0F4] border border-[#FF3D71]/30' 
                      : 'hover:bg-[#F7F9FC] border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={convAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={convTitle}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {other?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D68F] border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{convTitle}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">{conv.updatedAt}</span>
                    </div>

                    <p className="text-xs text-slate-500 truncate">
                      {conv.typingUsers && conv.typingUsers.length > 0 ? (
                        <span className="text-[#FF3D71] font-semibold italic animate-pulse">Typing...</span>
                      ) : (
                        conv.lastMessage?.text || (conv.lastMessage?.mediaUrl ? '📷 Photo attachment' : 'No messages yet')
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-[#FF3D71] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSecretDeleteTargetConv(conv);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/conv:opacity-100 transition-all cursor-pointer"
                      title="Delete conversation secretly (only for me)"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#F7F9FC]">
          
          {/* Header */}
          <div className="h-16 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => otherUser && setSelectedProfileUser(otherUser)}
                className="cursor-pointer flex items-center gap-3 group"
              >
                <div className="relative">
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={title}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D68F] border-2 border-white rounded-full" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#FF3D71] transition-colors flex items-center gap-1.5">
                    {title}
                    {otherUser?.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#3366FF]" />}
                  </h3>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {activeConversation.isGroup 
                      ? `${activeConversation.participants.length} participants` 
                      : isOnline ? 'Active now' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 text-slate-600">
              <button
                onClick={() => setSecretDeleteTargetConv(activeConversation)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                title="Delete conversation secretly (only for you)"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Secretly</span>
              </button>

              <button
                onClick={() => startCall(activeConversation.id, false)}
                className="p-2 rounded-xl bg-[#F7F9FC] hover:bg-[#F0F4F8] hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCall(activeConversation.id, true)}
                className="p-2 rounded-xl bg-[#F7F9FC] hover:bg-[#F0F4F8] hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  showRightPanel ? 'bg-[#FFF0F4] text-[#FF3D71] border-[#FF3D71]/30' : 'bg-[#F7F9FC] text-slate-500 border-slate-200 hover:text-slate-900'
                }`}
                title="Conversation Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <img src={avatar} alt={title} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-[#FF3D71]/40" />
                <h4 className="font-bold text-slate-900 text-base">{title}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {activeConversation.isGroup 
                    ? 'Start the group discussion by saying hi to everyone!' 
                    : `You are connected with ${title}. Send a message, voice note, or photo.`}
                </p>
              </div>
            ) : (
              currentMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                const sender = activeConversation.participants.find(p => p.id === msg.senderId) || otherUser;
                const isAudio = msg.mediaType === 'audio';

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
                      {!isMe && (
                        <img
                          src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={sender?.name}
                          onClick={() => sender && setSelectedProfileUser(sender)}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      <div className="space-y-1">
                        {/* Group Sender Name */}
                        {activeConversation.isGroup && !isMe && (
                          <span className="text-[10px] font-semibold text-slate-500 pl-1">
                            {sender?.name}
                          </span>
                        )}

                        {/* Image media */}
                        {msg.mediaUrl && (
                          <div className="rounded-2xl overflow-hidden max-h-64 border border-slate-200 bg-white shadow-xs">
                            <img src={msg.mediaUrl} alt="Attached" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Audio Waveform Voice Bubble */}
                        {isAudio ? (
                          <div className={`flex items-center gap-3 p-3 rounded-2xl shadow-xs ${
                            isMe ? 'bg-[#FF3D71] text-white' : 'bg-white text-slate-800 border border-slate-200'
                          }`}>
                            <button
                              onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 cursor-pointer"
                            >
                              {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div className="flex items-center gap-1">
                              {[30, 60, 90, 40, 80, 50, 70, 40, 60, 80, 40, 70].map((h, idx) => (
                                <div
                                  key={idx}
                                  className={`w-1 rounded-full ${playingAudioId === msg.id ? 'bg-white animate-pulse' : (isMe ? 'bg-white/60' : 'bg-slate-300')}`}
                                  style={{ height: `${(h / 100) * 20}px` }}
                                />
                              ))}
                            </div>
                            <span className="text-xs opacity-80 font-mono">
                              0:{msg.audioDuration ? msg.audioDuration.toString().padStart(2, '0') : '08'}
                            </span>
                          </div>
                        ) : (
                          /* Text bubble */
                          msg.text && (
                            <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-xs ${
                              isMe 
                                ? 'bg-[#FF3D71] text-white rounded-br-xs' 
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                            }`}>
                              {msg.text}
                            </div>
                          )
                        )}

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {msg.reactions.map((r, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs">
                                {r.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp & Hover Reactions */}
                    <div className={`flex items-center gap-2 mt-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isMe ? 'pr-1' : 'pl-10'
                    }`}>
                      <span>{msg.createdAt}</span>
                      {!isMe && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => reactToMessage(activeConversation.id, msg.id, '❤️')} className="hover:scale-125 transition-transform cursor-pointer">❤️</button>
                          <button onClick={() => reactToMessage(activeConversation.id, msg.id, '👍')} className="hover:scale-125 transition-transform cursor-pointer">👍</button>
                          <button onClick={() => reactToMessage(activeConversation.id, msg.id, '🔥')} className="hover:scale-125 transition-transform cursor-pointer">🔥</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {activeConversation.typingUsers && activeConversation.typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#FF3D71] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[#FF3D71] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-[#FF3D71] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-slate-500 font-medium">typing a response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Picker Box */}
          {showImagePicker && (
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 animate-in fade-in">
              <input
                type="url"
                placeholder="Image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71]"
              />
              <button
                onClick={() => setShowImagePicker(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Voice Note Recording Overlay */}
          {isRecordingVoice ? (
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF3D71] animate-ping" />
                <span className="text-xs font-bold text-[#FF3D71]">
                  Recording Voice Note (0:{recordSeconds.toString().padStart(2, '0')})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecordingVoice(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendVoiceNote}
                  className="px-4 py-1.5 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            /* Message Input Bar */
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#00D68F] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                title="Add Image"
              >
                <Image className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#FF3D71] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                title="Record Audio Note"
              >
                <Mic className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Type a message on Sphere..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#F7F9FC] border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
              />

              <button
                type="submit"
                disabled={!inputVal.trim() && !imageUrl}
                className="p-2.5 bg-[#FF3D71] hover:bg-[#e03161] disabled:opacity-30 text-white rounded-2xl transition-all shadow-md shadow-[#FF3D71]/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Select a chat to start messaging
        </div>
      )}

      {/* Right Details Panel (Collapsible) */}
      {showRightPanel && activeConversation && (
        <div className="w-72 border-l border-slate-200 bg-white hidden xl:flex flex-col p-4 space-y-4 overflow-y-auto">
          <div className="text-center py-4 border-b border-slate-200">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={title}
              className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#FF3D71] shadow-md"
              referrerPolicy="no-referrer"
            />
            <h3 className="font-bold text-sm text-slate-900 mt-3">{title}</h3>
            {otherUser && (
              <p className="text-xs text-slate-400 font-medium">@{otherUser.handle}</p>
            )}
            {otherUser && (
              <button
                onClick={() => setSelectedProfileUser(otherUser)}
                className="mt-3 px-3 py-1.5 bg-[#FFF0F4] hover:bg-[#ffe2e9] text-[#FF3D71] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                View Full Profile
              </button>
            )}
          </div>

          {/* Group members list if group */}
          {activeConversation.isGroup && (
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Participants ({activeConversation.participants.length})
              </span>
              <div className="space-y-1.5">
                {activeConversation.participants.map(member => (
                  <div key={member.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F9FC]">
                    <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    <span className="text-xs text-slate-700 font-medium truncate">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared Media */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Shared Media
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {currentMessages.filter(m => m.mediaUrl).map(m => (
                <div key={m.id} className="h-16 rounded-lg overflow-hidden border border-slate-200 bg-[#F7F9FC]">
                  <img src={m.mediaUrl} alt="Shared" className="w-full h-full object-cover" />
                </div>
              ))}
              {currentMessages.filter(m => m.mediaUrl).length === 0 && (
                <p className="text-[11px] text-slate-400 col-span-3 py-2">No media shared yet.</p>
              )}
            </div>
          </div>

          {/* Privacy & Secret Conversation Actions */}
          <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Privacy & Deletion</span>
            </div>
            <p className="text-[11px] text-red-600/90 leading-tight">
              Delete this entire conversation secretly from your feed only.
            </p>
            <button
              onClick={() => setSecretDeleteTargetConv(activeConversation)}
              className="w-full py-2 px-3 bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Conversation Secretly</span>
            </button>
          </div>

          {/* Privacy & Encryption notice */}
          <div className="mt-auto pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 text-[#00D68F] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sphere Secure Messaging</span>
            </div>
            <p className="font-normal text-slate-400">Direct messages on Sphere are secure and private between users.</p>
          </div>
        </div>
      )}

      {/* Secret Delete Confirmation Modal */}
      {secretDeleteTargetConv && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <EyeOff className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-lg text-slate-900">Delete Conversation Secretly?</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                This will delete and permanently remove this chat from <span className="font-bold text-slate-800">your</span> inbox and history.
              </p>
            </div>

            <div className="p-3 bg-[#F7F9FC] border border-slate-200/80 rounded-2xl text-xs text-slate-600 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>No notifications:</strong> The other participant will not be informed.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Independent history:</strong> Their copy of the chat remains untouched.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSecretDeleteTargetConv(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSecretDelete}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Secretly</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Direct Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Start a New Conversation</h3>
                <p className="text-xs text-slate-400">Search any user to send a direct message</p>
              </div>
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, @handle, email..."
                value={userPickerSearch}
                onChange={(e) => setUserPickerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
                autoFocus
              />
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {users
                .filter(u => u.id !== currentUser.id)
                .filter(u => {
                  if (!userPickerSearch.trim()) return true;
                  const q = userPickerSearch.toLowerCase().trim();
                  return (
                    u.name.toLowerCase().includes(q) ||
                    u.handle.toLowerCase().includes(q) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    u.bio.toLowerCase().includes(q)
                  );
                })
                .map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      const convId = startDirectChat(user);
                      if (convId) setActiveConversationId(convId);
                      setIsNewChatModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-[#F7F9FC] hover:bg-[#FFF0F4] hover:border-[#FF3D71]/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D68F] border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#FF3D71]">{user.name}</span>
                          {user.verified && <ShieldCheck className="w-3 h-3 text-[#3366FF]" />}
                        </div>
                        <span className="text-[11px] text-slate-400">@{user.handle}</span>
                        {user.bio && <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{user.bio}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1 bg-white group-hover:bg-[#FF3D71] text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-[#FF3D71] rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Message
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Group Chat Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Create Group Conversation</h3>
              <button 
                onClick={() => setIsNewGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Design Team, Hackathon Crew..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#FF3D71]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Add Participants</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {users.filter(u => u.id !== currentUser.id).map(user => {
                    const isChecked = selectedGroupMembers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedGroupMembers(prev => 
                            isChecked ? prev.filter(id => id !== user.id) : [...prev, user.id]
                          );
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-[#FFF0F4] border-[#FF3D71] text-slate-900' 
                            : 'bg-[#F7F9FC] border-slate-200 text-slate-700 hover:bg-[#F0F4F8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-xs font-bold block">{user.name}</span>
                            <span className="text-[10px] text-slate-400">@{user.handle}</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#FF3D71] focus:ring-[#FF3D71]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                  className="px-4 py-2 bg-[#FF3D71] hover:bg-[#e03161] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
