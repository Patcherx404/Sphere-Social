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
    <div className="fixed bottom-3 right-4 z-40 flex items-end gap-3 pointer-events-none">
      {floatingChats.map(convId => (
        <div key={convId} className="pointer-events-auto">
          <FloatingChatWindow conversationId={convId} />
        </div>
      ))}
    </div>
  );
};
