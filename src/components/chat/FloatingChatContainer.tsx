import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { FloatingChatWindow } from './FloatingChatWindow';

export const FloatingChatContainer: React.FC = () => {
  const { floatingChats, activeTab } = useSocial();

  // If in full messenger mode, we can hide floating windows to prevent double UI
  if (activeTab === 'messenger' || floatingChats.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-16 sm:bottom-3 right-2 sm:right-4 z-40 flex items-end justify-end gap-2 sm:gap-3 pointer-events-none max-w-[calc(100vw-1rem)]">
      {floatingChats.map(convId => (
        <div key={convId} className="pointer-events-auto max-w-full">
          <FloatingChatWindow conversationId={convId} />
        </div>
      ))}
    </div>
  );
};
