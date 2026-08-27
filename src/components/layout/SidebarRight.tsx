import React from 'react';
import { 
  Users, MessageCircle, UserPlus, Sparkles, TrendingUp, 
  Check, X, Zap, ShieldCheck
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const SidebarRight: React.FC = () => {
  const { 
    currentUser, 
    users, 
    friendRequests, 
    acceptFriendRequest, 
    declineFriendRequest,
    startDirectChat,
    setSelectedProfileUser,
    openFloatingChat,
    conversations
  } = useSocial();

  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const onlineUsers = otherUsers.filter(u => u.isOnline);
  const pendingRequests = friendRequests.filter(r => r.toUserId === currentUser.id && r.status === 'pending');

  const trendingTopics = [
    { tag: '#GenerativeDesign', posts: '4.8k posts', category: 'Design & Tech' },
    { tag: '#AlpineAscents', posts: '2.1k posts', category: 'Outdoors' },
    { tag: '#AnalogSynthesizer', posts: '1.9k posts', category: 'Music' },
    { tag: '#WebEngineering', posts: '5.2k posts', category: 'Technology' }
  ];

  return (
    <aside className="w-72 flex-shrink-0 hidden xl:block space-y-4">
      
      {/* Friend Requests Widget */}
      {pendingRequests.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#FF3D71]" />
              Friend Requests
            </span>
            <span className="px-1.5 py-0.5 bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] rounded-full text-[10px] font-bold">
              {pendingRequests.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-[#F7F9FC] p-2.5 rounded-xl border border-slate-200/60 space-y-2">
                <div 
                  onClick={() => setSelectedProfileUser(req.fromUser)}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img
                    src={req.fromUser.avatar}
                    alt={req.fromUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 truncate block group-hover:text-[#FF3D71] transition-colors">
                      {req.fromUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {req.mutualFriendsCount} mutual connections
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-gradient-to-r from-[#FF3D71] to-[#FF5C8A] hover:from-[#e62e60] hover:to-[#ff3d71] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => declineFriendRequest(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-[#F0F4F8] hover:bg-[#E2E8F0] text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Contacts (Direct 1-click Instant Chat) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            Online Contacts
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">{onlineUsers.length} online</span>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {otherUsers.map(user => {
            return (
              <button
                key={user.id}
                onClick={() => startDirectChat(user)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F0F4F8] transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {user.isOnline ? (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00D68F] border-2 border-white rounded-full" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-300 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#FF3D71] truncate block">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {user.isOnline ? 'Active now' : user.lastActive || 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-[#FF3D71] group-hover:bg-[#FFF0F4] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 px-0.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#FF3D71]" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trending in Sphere</span>
        </div>

        <div className="space-y-2.5">
          {trendingTopics.map(topic => (
            <div key={topic.tag} className="hover:bg-[#F0F4F8] p-2 rounded-xl transition-colors cursor-pointer">
              <div className="text-[10px] text-slate-400 font-semibold">{topic.category}</div>
              <div className="text-xs font-bold text-slate-800 hover:text-[#FF3D71]">{topic.tag}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{topic.posts}</div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
