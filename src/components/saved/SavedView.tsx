import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { PostCard } from '../feed/PostCard';

export const SavedView: React.FC = () => {
  const { posts } = useSocial();
  const savedPosts = posts.filter(p => p.saved);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#FF3D71] fill-[#FF3D71]" />
          Saved Bookmarks & Posts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Everything you bookmarked for later reading and reference.
        </p>
      </div>

      {savedPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs shadow-xs">
          <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No saved posts yet</p>
          <p className="text-slate-400 mt-1">Click the bookmark icon on any post in your feed to save it here.</p>
        </div>
      ) : (
        savedPosts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};
