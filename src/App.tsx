import React from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Navbar } from './components/layout/Navbar';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { CreatePostBox } from './components/feed/CreatePostBox';
import { PostCard } from './components/feed/PostCard';
import { FullMessenger } from './components/chat/FullMessenger';
import { FloatingChatContainer } from './components/chat/FloatingChatContainer';
import { FriendsView } from './components/friends/FriendsView';
import { SavedView } from './components/saved/SavedView';
import { ProfileModal } from './components/profile/ProfileModal';
import { CallModal } from './components/call/CallModal';
import { AuthView } from './components/auth/AuthView';
import { Compass, Users, MessageSquare } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, activeTab, posts, searchQuery } = useSocial();

  // If not logged in or no accounts yet, show Auth / Registration screen
  if (!currentUser) {
    return <AuthView />;
  }

  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      post.author.handle.toLowerCase().includes(q) ||
      (post.location && post.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col font-sans selection:bg-[#FF3D71]/20 selection:text-[#FF3D71]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'messenger' ? (
          <FullMessenger />
        ) : activeTab === 'friends' ? (
          <FriendsView />
        ) : activeTab === 'saved' ? (
          <SavedView />
        ) : (
          /* Timeline Feed Layout */
          <div className="flex gap-6 items-start justify-center">
            {/* Left Sidebar */}
            <SidebarLeft />

            {/* Central Feed Stream */}
            <div className="flex-1 max-w-2xl w-full">
              <CreatePostBox />

              {/* Feed Posts */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-xs space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#FF3D71] flex items-center justify-center mx-auto">
                      <Compass className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Your feed is waiting for your first post!</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Share your thoughts, photos, or question with the community using the box above.
                    </p>
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <SidebarRight />
          </div>
        )}
      </main>

      {/* Floating Chat Windows Dock */}
      <FloatingChatContainer />

      {/* Modals & Overlays */}
      <ProfileModal />
      <CallModal />
    </div>
  );
};

export default function App() {
  return (
    <SocialProvider>
      <MainContent />
    </SocialProvider>
  );
}
