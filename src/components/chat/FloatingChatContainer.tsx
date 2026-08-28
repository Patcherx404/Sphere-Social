import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { FloatingChatWindow } from './FloatingChatWindow';

export const FloatingChatContainer: React.FC = () => {
  const { floatingChats, activeTab } = useSocial();

  // If in full messenger mode, hide floating windows to prevent duplicate UI
  if (activeTab === 'messenger' || floatingChats.length === 0) {
    return null;
  }

  return (
    <aside 
      aria-label="Floating chat heads"
      className="fixed bottom-16 sm:bottom-4 right-3 sm:right-5 z-50 flex items-end justify-end gap-2.5 sm:gap-3 pointer-events-none max-w-[calc(100vw-1.5rem)]"
    >
      {floatingChats.map(convId => (
        <div key={convId} className="pointer-events-auto max-w-full">
          <FloatingChatWindow conversationId={convId} />
        </div>
      ))}
    </aside>
  );
};
