import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, MessageSquare, Bell, Compass, Users, Bookmark, 
  ChevronDown, Check, UserPlus, LogOut, X, ShieldCheck, 
  UserCheck, Clock, MessageCircle, ExternalLink, Plus
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { User, ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    posts,
    unreadMessagesTotal,
    unreadNotificationsTotal,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    conversations,
    openFloatingChat,
    startDirectChat,
    setSelectedProfileUser,
    getFriendStatus,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    removeFriend,
    friendRequests,
    logout
  } = useSocial();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTabFilter, setSearchTabFilter] = useState<'all' | 'people' | 'posts'>('all');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isMessagesMenuOpen, setIsMessagesMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target as Node)) {
        setIsMessagesMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const visibleConversations = conversations.filter(c => {
    if (c.deletedForUserIds?.includes(currentUser.id)) return false;
    if (c.participantIds && c.participantIds.length > 0 && !c.participantIds.includes(currentUser.id)) {
      return false;
    }
    return true;
  });

  // Search Results
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchedUsers = users.filter(u => {
    if (u.id === currentUser.id) return false;
    if (!trimmedQuery) return true; // Show suggestions if no query
    return (
      u.name.toLowerCase().includes(trimmedQuery) ||
      u.handle.toLowerCase().includes(trimmedQuery) ||
      (u.email && u.email.toLowerCase().includes(trimmedQuery)) ||
      u.bio.toLowerCase().includes(trimmedQuery)
    );
  });

  const matchedPosts = posts.filter(p => {
    if (!trimmedQuery) return false;
    return (
      p.content.toLowerCase().includes(trimmedQuery) ||
      p.author.name.toLowerCase().includes(trimmedQuery) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(trimmedQuery)))
    );
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-sm md:max-w-md" ref={searchContainerRef}>
          <button 
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none flex-shrink-0"
            title="Sphere Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3D71] to-[#FF7E44] flex items-center justify-center shadow-md shadow-[#FF3D71]/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl tracking-wider">S</span>
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight block">Sphere</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF3D71] block -mt-1">Connect & Chat</span>
            </div>
          </button>

          {/* Search Input with Instant Interactive Preview */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search friends, people, posts..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#F0F4F8] hover:bg-[#EAEFF5] focus:bg-white border border-transparent focus:border-[#FF3D71] rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF3D71]/20 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Instant Search Popup */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto w-80 sm:w-96">
                
                {/* Search Header & Category Filter Tabs */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {trimmedQuery ? 'Search Results' : 'Suggested Friends'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSearchTabFilter('all')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        searchTabFilter === 'all' ? 'bg-[#FF3D71] text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSearchTabFilter('people')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        searchTabFilter === 'people' ? 'bg-[#FF3D71] text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      People ({matchedUsers.length})
                    </button>
                  </div>
                </div>

                {/* People & Friends Results */}
                {(searchTabFilter === 'all' || searchTabFilter === 'people') && (
                  <div className="space-y-2 mb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      {trimmedQuery ? 'Friends & Users' : 'People to Add'}
                    </div>

                    {matchedUsers.length === 0 ? (
                      <p className="text-xs text-slate-400 px-2 py-2">No people found matching "{searchQuery}".</p>
                    ) : (
                      matchedUsers.slice(0, 5).map(user => {
                        const status = getFriendStatus(user.id);

                        return (
                          <div 
                            key={user.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#F7F9FC] hover:bg-[#FFF0F4]/60 border border-slate-200/70 transition-all group"
                          >
                            {/* User Avatar & Info */}
                            <div 
                              onClick={() => {
                                setSelectedProfileUser(user);
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                            >
                              <div className="relative flex-shrink-0">
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                {user.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D68F] border-2 border-white rounded-full" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#FF3D71] truncate">
                                    {user.name}
                                  </span>
                                  {user.verified && <ShieldCheck className="w-3 h-3 text-[#3366FF] flex-shrink-0" />}
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  @{user.handle} {user.friendsCount > 0 ? `• ${user.friendsCount} friends` : ''}
                                </span>
                              </div>
                            </div>

                            {/* Friend & Message Action Buttons */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {/* Direct Message Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startDirectChat(user);
                                  setIsSearchFocused(false);
                                }}
                                className="p-1.5 rounded-lg bg-white hover:bg-[#FF3D71] text-slate-600 hover:text-white border border-slate-200 hover:border-[#FF3D71] shadow-xs transition-colors cursor-pointer"
                                title="Message"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              {/* Friend Button */}
                              {status === 'friends' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFriend(user.id);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-red-50 text-emerald-600 hover:text-red-600 border border-emerald-200 hover:border-red-200 text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Click to Unfriend"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Friends</span>
                                </button>
                              ) : status === 'sent_pending' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelFriendRequest(user.id);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-slate-100 text-amber-700 hover:text-slate-700 border border-amber-200 text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Cancel Request"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Pending</span>
                                </button>
                              ) : status === 'received_pending' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const req = friendRequests.find(r => r.fromUser.id === user.id && r.toUserId === currentUser.id && r.status === 'pending');
                                    if (req) {
                                      acceptFriendRequest(req.id);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3366FF] hover:bg-[#254edb] text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Accept</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendFriendRequest(user.id);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF3D71] hover:bg-[#e03161] text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Posts Matching Search */}
                {trimmedQuery && (searchTabFilter === 'all' || searchTabFilter === 'posts') && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Matching Posts ({matchedPosts.length})
                    </div>
                    {matchedPosts.length === 0 ? (
                      <p className="text-xs text-slate-400 px-2 py-1">No posts found.</p>
                    ) : (
                      matchedPosts.slice(0, 3).map(post => (
                        <div
                          key={post.id}
                          onClick={() => {
                            setActiveTab('feed');
                            setIsSearchFocused(false);
                          }}
                          className="p-2 rounded-xl bg-[#F7F9FC] hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <img src={post.author.avatar} alt="Author" className="w-4 h-4 rounded-full object-cover" />
                            <span className="text-[11px] font-bold text-slate-800">{post.author.name}</span>
                            <span className="text-[10px] text-slate-400">• {post.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">{post.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Footer view all link */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveTab('friends');
                      setIsSearchFocused(false);
                    }}
                    className="text-xs text-[#FF3D71] hover:underline font-bold flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View all friends & connections</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('messenger')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'messenger'
                ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messenger</span>
            {unreadMessagesTotal > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-[#FF3D71] text-white rounded-full leading-none shadow-xs">
                {unreadMessagesTotal}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F0F4F8]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        </nav>

        {/* Right: Actions, Messages, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Messages Drawer Button */}
          <div className="relative" ref={msgRef}>
            <button
              onClick={() => setIsMessagesMenuOpen(!isMessagesMenuOpen)}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                isMessagesMenuOpen 
                  ? 'bg-[#FF3D71] text-white border-[#FF3D71] shadow-xs' 
                  : 'bg-[#F0F4F8] hover:bg-[#E2E8F0] text-slate-700 border-slate-200/80'
              }`}
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF3D71] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {unreadMessagesTotal}
                </span>
              )}
            </button>

            {isMessagesMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900">Direct Chats</span>
                  <button 
                    onClick={() => {
                      setActiveTab('messenger');
                      setIsMessagesMenuOpen(false);
                    }}
                    className="text-xs text-[#FF3D71] hover:text-[#e62e60] font-bold cursor-pointer"
                  >
                    Open Messenger
                  </button>
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {visibleConversations.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No active chats yet. Search a friend to start chatting!</p>
                  ) : (
                    visibleConversations.map(conv => {
                      const otherUser = conv.isGroup 
                        ? null 
                        : conv.participants.find(p => p.id !== currentUser.id) || conv.participants[0];
                      const title = conv.isGroup ? conv.name : otherUser?.name;
                      const avatar = conv.isGroup ? conv.avatar : otherUser?.avatar;
                      const isOnline = otherUser?.isOnline;

                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            openFloatingChat(conv.id);
                            setIsMessagesMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F4F8] transition-colors text-left group cursor-pointer"
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={title}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D68F] border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 truncate">{title}</span>
                              <span className="text-[10px] text-slate-400">{conv.updatedAt}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {conv.typingUsers && conv.typingUsers.length > 0 ? (
                                <span className="text-[#FF3D71] font-medium italic">Typing...</span>
                              ) : (
                                conv.lastMessage?.text || (conv.lastMessage?.mediaUrl ? '📷 Photo attachment' : 'Start chatting')
                              )}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="w-2.5 h-2.5 bg-[#FF3D71] rounded-full flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                isNotifMenuOpen 
                  ? 'bg-[#FF3D71] text-white border-[#FF3D71] shadow-xs' 
                  : 'bg-[#F0F4F8] hover:bg-[#E2E8F0] text-slate-700 border-slate-200/80'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF3D71] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationsTotal}
                </span>
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900">Notifications</span>
                  {unreadNotificationsTotal > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-[#FF3D71] hover:text-[#e62e60] font-bold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                          !notif.read ? 'bg-[#FFF0F4] border border-[#FFD0DE]' : 'hover:bg-[#F0F4F8]'
                        }`}
                      >
                        <img
                          src={notif.actor.avatar}
                          alt={notif.actor.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 leading-snug">
                            <span className="font-bold text-slate-900">{notif.actor.name} </span>
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.createdAt}</span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-[#FF3D71] rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-[#F0F4F8] hover:bg-[#E2E8F0] border border-slate-200 transition-colors focus:outline-none cursor-pointer"
              title="My Account"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-[#FF3D71]"
                referrerPolicy="no-referrer"
              />
              <span className="hidden lg:inline text-xs font-bold text-slate-800 max-w-[90px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div 
                  onClick={() => {
                    setSelectedProfileUser(currentUser);
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F0F4F8] cursor-pointer transition-colors"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">@{currentUser.handle}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-1 pt-1 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedProfileUser(currentUser);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#F0F4F8] text-left cursor-pointer"
                  >
                    <span>View Profile & Bio</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#FF3D71] hover:bg-[#FFF0F4] text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
