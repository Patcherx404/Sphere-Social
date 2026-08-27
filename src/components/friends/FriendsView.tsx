import React, { useState } from 'react';
import { 
  Users, UserPlus, UserCheck, MessageCircle, Search, 
  Check, X, Sparkles, ShieldCheck, Clock, UserMinus
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { User } from '../../types';

export const FriendsView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    friendRequests, 
    getFriendStatus,
    acceptFriendRequest, 
    declineFriendRequest, 
    sendFriendRequest, 
    cancelFriendRequest,
    removeFriend,
    startDirectChat,
    setSelectedProfileUser 
  } = useSocial();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'requests' | 'suggestions'>('all');
  const [search, setSearch] = useState('');

  if (!currentUser) return null;

  const pendingIncomingRequests = friendRequests.filter(r => r.toUserId === currentUser.id && r.status === 'pending');
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  // Filter users by search
  const filteredUsers = otherUsers.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) || 
      u.handle.toLowerCase().includes(q) || 
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.bio.toLowerCase().includes(q)
    );
  });

  const myFriends = filteredUsers.filter(u => getFriendStatus(u.id) === 'friends');
  const discoverUsers = filteredUsers.filter(u => getFriendStatus(u.id) !== 'friends');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner & Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF3D71]" />
              Friends & Connections
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search friends, manage requests, and discover people to connect with.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, @username, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              activeSubTab === 'all'
                ? 'bg-[#FF3D71] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F7F9FC]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Friends ({myFriends.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              activeSubTab === 'requests'
                ? 'bg-[#FF3D71] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F7F9FC]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Friend Requests</span>
            {pendingIncomingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#3366FF] text-white rounded-full text-[10px] font-bold">
                {pendingIncomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              activeSubTab === 'suggestions'
                ? 'bg-[#FF3D71] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F7F9FC]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Discover & Add Friends ({discoverUsers.length})</span>
          </button>
        </div>
      </div>

      {/* Requests Section */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Incoming Friend Requests ({pendingIncomingRequests.length})
          </h2>

          {pendingIncomingRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xs space-y-2">
              <p className="font-semibold text-slate-700">No pending friend requests right now.</p>
              <p className="text-slate-400">Search or discover new friends to expand your network!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingIncomingRequests.map(req => (
                <div key={req.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                  <div 
                    onClick={() => setSelectedProfileUser(req.fromUser)}
                    className="flex items-center gap-3 cursor-pointer group mb-3"
                  >
                    <img
                      src={req.fromUser.avatar}
                      alt={req.fromUser.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-[#FF3D71] transition-colors truncate">
                          {req.fromUser.name}
                        </span>
                        {req.fromUser.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#3366FF] flex-shrink-0" />}
                      </div>
                      <span className="text-xs text-slate-400 block truncate">@{req.fromUser.handle}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{req.fromUser.bio}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => acceptFriendRequest(req.id)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Friend</span>
                    </button>
                    <button
                      onClick={() => declineFriendRequest(req.id)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Friends List */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Connected Friends ({myFriends.length})
            </h2>
            {myFriends.length === 0 && (
              <button
                onClick={() => setActiveSubTab('suggestions')}
                className="text-xs font-bold text-[#FF3D71] hover:underline"
              >
                + Discover People to Add
              </button>
            )}
          </div>

          {myFriends.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F4] text-[#FF3D71] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">You haven't added any friends yet.</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Use the search bar above or browse suggested people to send friend requests!
              </p>
              <button
                onClick={() => setActiveSubTab('suggestions')}
                className="mt-2 px-4 py-2 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Discover People</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myFriends.map(user => (
                <div 
                  key={user.id}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="h-16 bg-slate-100 relative overflow-hidden">
                    <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  <div className="p-4 pt-0 flex-1 flex flex-col justify-between">
                    <div className="-mt-8 mb-2 flex items-end justify-between">
                      <div 
                        onClick={() => setSelectedProfileUser(user)}
                        className="relative cursor-pointer group"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D68F] border-2 border-white rounded-full" />
                        )}
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                        Friends ✓
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-1">
                        <h3 
                          onClick={() => setSelectedProfileUser(user)}
                          className="font-bold text-sm text-slate-900 hover:text-[#FF3D71] cursor-pointer truncate"
                        >
                          {user.name}
                        </h3>
                        {user.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#3366FF] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 truncate">@{user.handle}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">{user.bio}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-100">
                      <button
                        onClick={() => startDirectChat(user)}
                        className="flex items-center justify-center gap-1.5 py-2 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                      
                      <button
                        onClick={() => removeFriend(user.id)}
                        className="flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        title="Unfriend"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Unfriend</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discover & Suggestions Grid */}
      {activeSubTab === 'suggestions' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            People on Sphere ({discoverUsers.length})
          </h2>

          {discoverUsers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xs">
              No other users found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoverUsers.map(user => {
                const status = getFriendStatus(user.id);

                return (
                  <div 
                    key={user.id}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Cover & Avatar Banner */}
                    <div className="h-16 bg-slate-100 relative overflow-hidden">
                      <img
                        src={user.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>

                    <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
                      {/* Avatar */}
                      <div className="-mt-8 mb-2 flex items-end justify-between">
                        <div 
                          onClick={() => setSelectedProfileUser(user)}
                          className="relative cursor-pointer group"
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D68F] border-2 border-white rounded-full" />
                          )}
                        </div>

                        <div className="text-right text-[10px] text-slate-400 font-medium">
                          <span className="font-bold text-[#3366FF]">{user.friendsCount}</span> friends
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mb-3">
                        <div className="flex items-center gap-1">
                          <h3 
                            onClick={() => setSelectedProfileUser(user)}
                            className="font-bold text-sm text-slate-900 hover:text-[#FF3D71] cursor-pointer truncate"
                          >
                            {user.name}
                          </h3>
                          {user.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#3366FF] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 truncate">@{user.handle}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {user.bio}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-100">
                        {status === 'sent_pending' ? (
                          <button
                            onClick={() => cancelFriendRequest(user.id)}
                            className="flex items-center justify-center gap-1 py-2 bg-amber-50 hover:bg-slate-100 text-amber-700 hover:text-slate-700 border border-amber-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        ) : status === 'received_pending' ? (
                          <button
                            onClick={() => {
                              const req = friendRequests.find(r => r.fromUser.id === user.id && r.toUserId === currentUser.id);
                              if (req) acceptFriendRequest(req.id);
                            }}
                            className="flex items-center justify-center gap-1 py-2 bg-[#3366FF] hover:bg-[#254edb] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="flex items-center justify-center gap-1 py-2 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Friend</span>
                          </button>
                        )}

                        <button
                          onClick={() => startDirectChat(user)}
                          className="flex items-center justify-center gap-1 py-2 bg-[#F7F9FC] hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
