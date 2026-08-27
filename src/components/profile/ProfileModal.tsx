import React, { useState } from 'react';
import { 
  X, MapPin, Briefcase, GraduationCap, Globe, Calendar, 
  MessageCircle, UserPlus, Edit3, ShieldCheck, Image, Users, 
  Check, Sparkles, Clock, UserMinus, Mail
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { User, Post } from '../../types';
import { PostCard } from '../feed/PostCard';

export const ProfileModal: React.FC = () => {
  const { 
    selectedProfileUser, 
    setSelectedProfileUser, 
    currentUser, 
    updateCurrentUserProfile,
    startDirectChat,
    posts,
    users,
    getFriendStatus,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    removeFriend,
    friendRequests
  } = useSocial();

  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos' | 'friends'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  if (!selectedProfileUser || !currentUser) return null;

  const isSelf = selectedProfileUser.id === currentUser.id;
  const user = isSelf ? currentUser : (users.find(u => u.id === selectedProfileUser.id) || selectedProfileUser);
  const userPosts = posts.filter(p => p.author.id === user.id);
  const friendStatus = getFriendStatus(user.id);

  const handleSaveBio = () => {
    if (isSelf) {
      updateCurrentUserProfile({ bio: bioInput });
      setIsEditingBio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-60 bg-slate-100 flex-shrink-0">
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={() => setSelectedProfileUser(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 pb-4 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  referrerPolicy="no-referrer"
                />
                {user.isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#00D68F] border-3 border-white rounded-full" />
                )}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h2>
                  {user.verified && <ShieldCheck className="w-5 h-5 text-[#3366FF]" />}
                </div>
                <p className="text-xs text-slate-400">@{user.handle} {user.email ? `• ${user.email}` : ''}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-500">
                  <span><strong className="text-slate-900 font-bold">{user.friendsCount}</strong> Friends</span>
                  <span><strong className="text-slate-900 font-bold">{user.followersCount}</strong> Followers</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2">
              {!isSelf ? (
                <>
                  <button
                    onClick={() => {
                      startDirectChat(user);
                      setSelectedProfileUser(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>

                  {/* Friend Status Action Button */}
                  {friendStatus === 'friends' ? (
                    <button
                      onClick={() => removeFriend(user.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-red-50 text-emerald-600 hover:text-red-600 border border-emerald-200 hover:border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Click to unfriend"
                    >
                      <Check className="w-4 h-4" />
                      <span>Friends</span>
                    </button>
                  ) : friendStatus === 'sent_pending' ? (
                    <button
                      onClick={() => cancelFriendRequest(user.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-slate-100 text-amber-700 hover:text-slate-700 border border-amber-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      title="Cancel Request"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Pending</span>
                    </button>
                  ) : friendStatus === 'received_pending' ? (
                    <button
                      onClick={() => {
                        const req = friendRequests.find(r => r.fromUser.id === user.id && r.toUserId === currentUser.id);
                        if (req) acceptFriendRequest(req.id);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#3366FF] hover:bg-[#254edb] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#FF3D71] hover:bg-[#e03161] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Friend</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setBioInput(user.bio);
                    setIsEditingBio(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#F7F9FC] hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Bio text */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-1 text-xs font-bold text-white bg-[#FF3D71] hover:bg-[#e03161] rounded-lg cursor-pointer"
                  >
                    Save Bio
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed">{user.bio}</p>
            )}
          </div>

          {/* Details metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {user.joinedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#3366FF]" />
              <span>Public Profile</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Identity</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-[#F7F9FC]">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'posts'
                ? 'border-[#FF3D71] text-[#FF3D71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Posts ({userPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'friends'
                ? 'border-[#FF3D71] text-[#FF3D71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Friends & Mutuals
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-[#F7F9FC] flex-1">
          {activeTab === 'posts' ? (
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-xs">
                  No posts shared yet by {user.name}.
                </div>
              ) : (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sphere Community Connections
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.filter(u => u.id !== user.id).slice(0, 6).map(peer => (
                  <div 
                    key={peer.id} 
                    onClick={() => setSelectedProfileUser(peer)}
                    className="flex items-center gap-2.5 p-2 bg-white border border-slate-200/80 rounded-xl hover:border-[#FF3D71]/40 cursor-pointer shadow-xs transition-colors"
                  >
                    <img src={peer.avatar} alt={peer.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{peer.name}</h5>
                      <span className="text-[10px] text-slate-400 block truncate">@{peer.handle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
