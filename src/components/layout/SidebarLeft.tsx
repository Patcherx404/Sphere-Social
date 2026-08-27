import React, { useState } from 'react';
import { 
  Compass, MessageSquare, Users, Bookmark, Sparkles, Plus, 
  Hash, ShieldCheck, Film, Layers, UserCheck, Settings
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const SidebarLeft: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    setSelectedProfileUser,
    conversations,
    openFloatingChat,
    createGroupChat,
    users
  } = useSocial();

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length === 0) return;
    createGroupChat(groupName.trim(), selectedFriends);
    setGroupName('');
    setSelectedFriends([]);
    setIsNewGroupModalOpen(false);
  };

  const groupConversations = conversations.filter(c => c.isGroup);

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block space-y-4">
      {/* Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div 
          onClick={() => setSelectedProfileUser(currentUser)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-[#FF3D71] group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            {currentUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D68F] border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-[#FF3D71] transition-colors">
                {currentUser.name}
              </h3>
              {currentUser.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#3366FF] flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">@{currentUser.handle}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-[#F7F9FC] border border-slate-100 rounded-xl py-1.5 px-2">
            <span className="block font-extrabold text-[#FF3D71] text-sm">{currentUser.friendsCount}</span>
            <span className="text-[10px] text-slate-500 font-semibold">Friends</span>
          </div>
          <div className="bg-[#F7F9FC] border border-slate-100 rounded-xl py-1.5 px-2">
            <span className="block font-extrabold text-[#3366FF] text-sm">{currentUser.followersCount}</span>
            <span className="text-[10px] text-slate-500 font-semibold">Followers</span>
          </div>
        </div>
      </div>

      {/* Main Navigation links */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs space-y-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
            activeTab === 'feed'
              ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
              : 'text-slate-600 hover:bg-[#F0F4F8] hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-[#FF3D71]" />
          <span>Timeline Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('messenger')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
            activeTab === 'messenger'
              ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
              : 'text-slate-600 hover:bg-[#F0F4F8] hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#3366FF]" />
          <span>Full Messenger</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
            activeTab === 'friends'
              ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
              : 'text-slate-600 hover:bg-[#F0F4F8] hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-[#00D68F]" />
          <span>Friends & Connect</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
            activeTab === 'saved'
              ? 'bg-[#FFF0F4] text-[#FF3D71] border border-[#FFD0DE] shadow-xs'
              : 'text-slate-600 hover:bg-[#F0F4F8] hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4 text-[#FFAB00]" />
          <span>Saved Bookmarks</span>
        </button>
      </div>

      {/* Group Chats & Spaces */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Group Spaces</span>
          <button
            onClick={() => setIsNewGroupModalOpen(true)}
            className="p-1 rounded-lg bg-[#FFF0F4] hover:bg-[#FFE5ED] text-[#FF3D71] border border-[#FFD0DE] transition-colors"
            title="Create Group Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {groupConversations.map(group => (
            <button
              key={group.id}
              onClick={() => openFloatingChat(group.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#F0F4F8] transition-colors text-left group"
            >
              <img
                src={group.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100'}
                alt={group.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-slate-700 group-hover:text-slate-900 font-semibold truncate flex-1">
                {group.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* New Group Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Group Chat</h3>
              <button 
                onClick={() => setIsNewGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Hikers, AI Hackers..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F4F8] border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#FF3D71]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Members</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {users.filter(u => u.id !== currentUser.id).map(user => {
                    const isChecked = selectedFriends.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedFriends(prev => 
                            isChecked ? prev.filter(id => id !== user.id) : [...prev, user.id]
                          );
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-[#FFF0F4] border-[#FF3D71] text-slate-900 font-medium' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-[#F0F4F8]'
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
                            <span className="text-xs font-bold block text-slate-900">{user.name}</span>
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#F0F4F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedFriends.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF3D71] to-[#FF5C8A] hover:from-[#e62e60] hover:to-[#ff3d71] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
