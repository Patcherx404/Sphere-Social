import { User, Post, Conversation, ChatMessage, AppNotification, FriendRequest } from '../types';

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
];

export const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_projectile',
    name: 'Projectile AFK',
    handle: 'projectile_afk',
    email: 'projectile.afk@gmail.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Product builder & digital nomad. Exploring next-gen social web ✨',
    joinedDate: 'Aug 2026',
    isOnline: true,
    friendsCount: 3,
    followersCount: 142,
    verified: true,
    friends: ['user_sarah', 'user_alex', 'user_elena']
  },
  {
    id: 'user_sarah',
    name: 'Sarah Chen',
    handle: 'sarah_c',
    email: 'sarah.chen@sphere.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    bio: 'UI/UX architect & photographer 📸 Building high-craft digital interfaces.',
    joinedDate: 'Jan 2026',
    isOnline: true,
    friendsCount: 28,
    followersCount: 890,
    verified: true,
    friends: ['user_projectile', 'user_alex']
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    handle: 'arivera',
    email: 'alex.rivera@sphere.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    bio: 'Fullstack engineer & open-source contributor. Coffee, TypeScript & AI ☕',
    joinedDate: 'Mar 2026',
    isOnline: true,
    friendsCount: 42,
    followersCount: 1205,
    verified: false,
    friends: ['user_projectile', 'user_sarah']
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    handle: 'elena_r',
    email: 'elena.rostova@sphere.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    bio: 'AI researcher & minimalist. Exploring generative creative agents 🤖🎨',
    joinedDate: 'Apr 2026',
    isOnline: false,
    friendsCount: 19,
    followersCount: 650,
    verified: true,
    friends: ['user_projectile']
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    author: INITIAL_USERS[1], // Sarah Chen
    content: 'Just deployed the new responsive design system on Sphere! Fast real-time chat, fluid animations, and rich media support. What do you all think? 🚀✨',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
    audience: 'public',
    createdAt: '15m ago',
    reactions: {
      like: 12,
      love: 18,
      care: 4,
      haha: 0,
      wow: 6,
      sad: 0,
      fire: 9
    },
    comments: [
      {
        id: 'c1',
        postId: 'post_1',
        author: INITIAL_USERS[2], // Alex Rivera
        content: 'Super smooth! The interaction design feels responsive.',
        createdAt: '10m ago',
        likesCount: 3
      }
    ],
    sharesCount: 5
  },
  {
    id: 'post_2',
    author: INITIAL_USERS[0], // Projectile AFK
    content: 'Testing out the new Google / Gmail authentication and live friend messaging on Sphere. Everything feels instant and clean! 🌐💬',
    audience: 'public',
    createdAt: '1h ago',
    reactions: {
      like: 14,
      love: 8,
      care: 2,
      haha: 0,
      wow: 5,
      sad: 0,
      fire: 7
    },
    comments: [],
    sharesCount: 2
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    isGroup: false,
    participantIds: ['user_projectile', 'user_sarah'],
    participants: [INITIAL_USERS[0], INITIAL_USERS[1]],
    unreadCount: 1,
    updatedAt: 'Just now',
    lastMessage: {
      id: 'm_last',
      conversationId: 'conv_1',
      senderId: 'user_sarah',
      text: 'Hey! Are you testing the Vercel deployment?',
      createdAt: 'Just now',
      read: false
    }
  },
  {
    id: 'conv_2',
    isGroup: false,
    participantIds: ['user_projectile', 'user_alex'],
    participants: [INITIAL_USERS[0], INITIAL_USERS[2]],
    unreadCount: 0,
    updatedAt: '2h ago',
    lastMessage: {
      id: 'm_alex_last',
      conversationId: 'conv_2',
      senderId: 'user_alex',
      text: 'Let me know if you need any help with the friend requests!',
      createdAt: '2h ago',
      read: true
    }
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv_1': [
    {
      id: 'm1',
      conversationId: 'conv_1',
      senderId: 'user_sarah',
      text: 'Hi there! Welcome to Sphere Social.',
      createdAt: '10:15 AM',
      read: true
    },
    {
      id: 'm2',
      conversationId: 'conv_1',
      senderId: 'user_projectile',
      text: 'Hey Sarah! Loving the new real-time layout.',
      createdAt: '10:16 AM',
      read: true
    },
    {
      id: 'm3',
      conversationId: 'conv_1',
      senderId: 'user_sarah',
      text: 'Hey! Are you testing the Vercel deployment?',
      createdAt: 'Just now',
      read: false
    }
  ],
  'conv_2': [
    {
      id: 'm_a1',
      conversationId: 'conv_2',
      senderId: 'user_alex',
      text: 'Let me know if you need any help with the friend requests!',
      createdAt: '2h ago',
      read: true
    }
  ]
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'like',
    actor: INITIAL_USERS[1],
    message: 'reacted with ❤️ to your post.',
    createdAt: '20m ago',
    read: false,
    targetId: 'post_2'
  }
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [];

