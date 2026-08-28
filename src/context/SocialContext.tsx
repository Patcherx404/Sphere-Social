import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Post, Conversation, ChatMessage, AppNotification, 
  FriendRequest, ReactionType, ActiveTab, FriendStatusType 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_POSTS, 
  INITIAL_CONVERSATIONS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, 
  INITIAL_FRIEND_REQUESTS, AVATAR_PRESETS, COVER_PRESETS 
} from '../data/mockData';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  db, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  onSnapshot,
  deleteDoc
} from '../lib/firebase';

interface SocialContextType {
  currentUser: User | null;
  users: User[];
  registerUser: (data: { name: string; handle: string; email?: string; password: string; avatar?: string; bio?: string }) => { success: boolean; error?: string };
  loginUser: (handleOrEmail: string, password?: string) => { success: boolean; error?: string };
  loginWithGoogleFirebase: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email: string, name?: string, avatar?: string) => { success: boolean; error?: string };
  loginWithUserId: (userId: string) => void;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Search & Global
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Profile
  selectedProfileUser: User | null;
  setSelectedProfileUser: (user: User | null) => void;
  updateCurrentUserProfile: (updates: Partial<User>) => void;
  
  // Posts
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'sharesCount'>) => void;
  reactToPost: (postId: string, reaction: ReactionType) => void;
  addComment: (postId: string, content: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  sharePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  deletePost: (postId: string) => void;
  
  // Chat & Messaging
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  floatingChats: string[];
  openFloatingChat: (conversationId: string) => void;
  closeFloatingChat: (conversationId: string) => void;
  minimizedChats: Record<string, boolean>;
  toggleMinimizeChat: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: { 
    text?: string; 
    mediaUrl?: string; 
    mediaType?: 'image' | 'audio' | 'file'; 
    audioDuration?: number; 
    replyTo?: { id: string; text: string; senderName: string } 
  }) => void;
  reactToMessage: (conversationId: string, messageId: string, emoji: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  deleteConversationSecretly: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  startDirectChat: (targetUser: User) => string;
  createGroupChat: (name: string, participantUserIds: string[]) => string;
  unreadMessagesTotal: number;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsTotal: number;
  
  // Friend System
  friendRequests: FriendRequest[];
  getFriendStatus: (targetUserId: string) => FriendStatusType;
  sendFriendRequest: (toUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  cancelFriendRequest: (toUserId: string) => void;
  removeFriend: (targetUserId: string) => void;
  isFriend: (userId: string) => boolean;
  
  // Audio / Video call modal state
  activeCall: { conversationId: string; user?: User; isGroup?: boolean; isVideo?: boolean } | null;
  startCall: (conversationId: string, isVideo?: boolean) => void;
  endCall: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'sphere_real_current_user_v5',
  USERS: 'sphere_real_users_v5',
  POSTS: 'sphere_real_posts_v5',
  CONVERSATIONS: 'sphere_real_conversations_v5',
  MESSAGES: 'sphere_real_messages_v5',
  NOTIFICATIONS: 'sphere_real_notifications_v5',
  FRIEND_REQUESTS: 'sphere_real_friend_requests_v5'
};

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load real registered users from LocalStorage and Firestore
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn('LocalStorage users parse error:', e);
      }
    }
    return [];
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || null;
  });

  const currentUser = users.find(u => u.id === currentUserId) || null;

  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [floatingChats, setFloatingChats] = useState<string[]>([]);
  const [minimizedChats, setMinimizedChats] = useState<Record<string, boolean>>({});

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeCall, setActiveCall] = useState<{ conversationId: string; user?: User; isGroup?: boolean; isVideo?: boolean } | null>(null);

  // 1. Real-time Firestore USERS listener
  useEffect(() => {
    try {
      const usersColRef = collection(db, 'users');
      const unsubscribe = onSnapshot(usersColRef, (snapshot) => {
        const firestoreUsers: User[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as User;
          if (data && data.id) {
            firestoreUsers.push(data);
          }
        });
        if (firestoreUsers.length > 0) {
          setUsers(prev => {
            const map = new Map<string, User>();
            prev.forEach(u => map.set(u.id, u));
            firestoreUsers.forEach(u => map.set(u.id, { ...(map.get(u.id) || {}), ...u }));
            return Array.from(map.values());
          });
        }
      }, (error) => {
        console.warn('Firestore users sync note:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore users listener initialization:', e);
    }
  }, []);

  // 2. Real-time Firestore CONVERSATIONS listener
  useEffect(() => {
    try {
      const convColRef = collection(db, 'conversations');
      const unsubscribe = onSnapshot(convColRef, (snapshot) => {
        const firestoreConvs: Conversation[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Conversation;
          if (data && data.id) {
            firestoreConvs.push(data);
          }
        });
        if (firestoreConvs.length > 0) {
          setConversations(prev => {
            const map = new Map<string, Conversation>();
            prev.forEach(c => map.set(c.id, c));
            firestoreConvs.forEach(c => map.set(c.id, { ...(map.get(c.id) || {}), ...c }));
            return Array.from(map.values()).sort((a: any, b: any) => {
              const tA = a.timestamp || 0;
              const tB = b.timestamp || 0;
              return tB - tA;
            });
          });
        }
      }, (error) => {
        console.warn('Firestore conv sync note:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore conv listener initialization:', e);
    }
  }, []);

  // 3. Real-time Firestore MESSAGES listener
  useEffect(() => {
    try {
      const msgColRef = collection(db, 'messages');
      const unsubscribe = onSnapshot(msgColRef, (snapshot) => {
        const newMsgMap: Record<string, ChatMessage[]> = {};
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as ChatMessage & { timestamp?: number };
          if (data && data.id && data.conversationId) {
            const timestampNum = typeof data.timestamp === 'number' && !isNaN(data.timestamp) && data.timestamp > 0
              ? data.timestamp
              : Date.now();
            const msgItem: ChatMessage = {
              ...data,
              timestamp: timestampNum
            };
            if (!newMsgMap[data.conversationId]) {
              newMsgMap[data.conversationId] = [];
            }
            newMsgMap[data.conversationId].push(msgItem);
          }
        });

        setMessages(prev => {
          const merged: Record<string, ChatMessage[]> = { ...prev };
          Object.keys(newMsgMap).forEach(convId => {
            const existing = prev[convId] || [];
            const map = new Map<string, ChatMessage>();
            existing.forEach(m => map.set(m.id, m));
            newMsgMap[convId].forEach(m => map.set(m.id, m));
            const list = Array.from(map.values());
            list.sort((a: any, b: any) => {
              const tA = a.timestamp || 0;
              const tB = b.timestamp || 0;
              return tA - tB;
            });
            merged[convId] = list;
          });
          return merged;
        });
      }, (error) => {
        console.warn('Firestore messages sync note:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore messages listener initialization:', e);
    }
  }, []);

  // 4. Real-time Firestore POSTS listener
  useEffect(() => {
    try {
      const postsColRef = collection(db, 'posts');
      const unsubscribe = onSnapshot(postsColRef, (snapshot) => {
        const firestorePosts: Post[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Post;
          if (data && data.id) {
            firestorePosts.push(data);
          }
        });
        if (firestorePosts.length > 0) {
          setPosts(prev => {
            const map = new Map<string, Post>();
            prev.forEach(p => map.set(p.id, p));
            firestorePosts.forEach(p => map.set(p.id, { ...(map.get(p.id) || {}), ...p }));
            return Array.from(map.values()).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
          });
        }
      }, (error) => {
        console.warn('Firestore posts sync note:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore posts listener initialization:', e);
    }
  }, []);

  // 5. Real-time Firestore FRIEND REQUESTS listener
  useEffect(() => {
    try {
      const frColRef = collection(db, 'friendRequests');
      const unsubscribe = onSnapshot(frColRef, (snapshot) => {
        const reqList: FriendRequest[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as FriendRequest;
          if (data && data.id) {
            reqList.push(data);
          }
        });
        setFriendRequests(reqList);
      }, (error) => {
        console.warn('Firestore friend requests sync note:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore friend requests listener initialization:', e);
    }
  }, []);

  // 6. Real-time Firestore NOTIFICATIONS listener
  useEffect(() => {
    try {
      const notifColRef = collection(db, 'notifications');
      const unsubscribe = onSnapshot(notifColRef, (snapshot) => {
        const notifList: AppNotification[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as AppNotification & { toUserId?: string; timestamp?: number };
          if (data && data.id) {
            notifList.push(data);
          }
        });
        if (notifList.length > 0) {
          setNotifications(prev => {
            const map = new Map<string, AppNotification>();
            prev.forEach(n => map.set(n.id, n));
            notifList.forEach(n => map.set(n.id, { ...(map.get(n.id) || {}), ...n }));
            return Array.from(map.values()).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
          });
        }
      }, (error) => {
        console.warn('Firestore notifications sync note:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore notifications listener initialization:', e);
    }
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(friendRequests));
  }, [friendRequests]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as User;
            setUsers(prev => {
              const exists = prev.some(u => u.id === data.id);
              if (exists) {
                return prev.map(u => u.id === data.id ? { ...u, ...data, isOnline: true } : u);
              }
              return [{ ...data, isOnline: true }, ...prev];
            });
            setCurrentUserId(data.id);
          } else {
            const email = firebaseUser.email || '';
            const emailPrefix = email ? email.split('@')[0] : 'user';
            const derivedName = firebaseUser.displayName || emailPrefix
              .split(/[._-]/)
              .map(s => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' ') || 'Google User';
            const derivedHandle = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`;

            let finalHandle = derivedHandle;
            let counter = 1;
            while (users.some(u => u.handle.toLowerCase() === finalHandle && u.id !== firebaseUser.uid)) {
              finalHandle = `${derivedHandle}${counter}`;
              counter++;
            }

            const newGoogleUser: User = {
              id: firebaseUser.uid,
              name: derivedName,
              handle: finalHandle,
              email: email || undefined,
              avatar: firebaseUser.photoURL || AVATAR_PRESETS[0],
              coverPhoto: COVER_PRESETS[0],
              bio: `Signed in via Google (${email || 'Firebase Auth'}) 🌐`,
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              isOnline: true,
              friendsCount: 0,
              followersCount: 0,
              verified: true,
              friends: []
            };

            await setDoc(userDocRef, newGoogleUser);
            setUsers(prev => [newGoogleUser, ...prev]);
            setCurrentUserId(newGoogleUser.id);
          }
        } catch (err) {
          console.warn('Firestore profile sync note:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // --- AUTHENTICATION METHODS ---
  const loginWithGoogleFirebase = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      if (firebaseUser) {
        // Create/sync user immediately
        const email = firebaseUser.email || 'projectile.afk@gmail.com';
        const emailPrefix = email.split('@')[0];
        const derivedName = firebaseUser.displayName || emailPrefix
          .split(/[._-]/)
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ') || 'Google User';
        const derivedHandle = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`;

        const newGoogleUser: User = {
          id: firebaseUser.uid,
          name: derivedName,
          handle: derivedHandle,
          email: email,
          avatar: firebaseUser.photoURL || AVATAR_PRESETS[0],
          coverPhoto: COVER_PRESETS[0],
          bio: `Signed in via Google (${email}) 🌐`,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          isOnline: true,
          friendsCount: 0,
          followersCount: 0,
          verified: true,
          friends: []
        };

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), newGoogleUser, { merge: true });
        } catch (e) {
          console.warn('Firestore sync failed:', e);
        }

        setUsers(prev => {
          const filtered = prev.filter(u => u.id !== firebaseUser.uid);
          return [newGoogleUser, ...filtered];
        });
        setCurrentUserId(firebaseUser.uid);

        return { success: true };
      }
      return { success: false, error: 'No user credential received from Google.' };
    } catch (err: any) {
      console.warn('Firebase Google Sign-In error:', err);
      let errorMsg = err.message || 'Google sign-in could not be completed.';
      if (err.code === 'auth/popup-blocked') {
        errorMsg = 'Popup was blocked by your browser/iframe.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign-in popup was closed before completing.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = 'Sign-in cancelled.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const registerUser = (data: { 
    name: string; 
    handle: string; 
    email?: string; 
    password: string; 
    avatar?: string; 
    bio?: string;
  }): { success: boolean; error?: string } => {
    const cleanHandle = data.handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanHandle) {
      return { success: false, error: 'Please enter a valid username (letters, numbers, underscores).' };
    }

    const existingHandle = users.find(u => u.handle.toLowerCase() === cleanHandle);
    if (existingHandle) {
      return { success: false, error: 'Username is already taken. Please pick another one.' };
    }

    if (data.email) {
      const existingEmail = users.find(u => u.email && u.email.toLowerCase() === data.email?.toLowerCase());
      if (existingEmail) {
        return { success: false, error: 'An account with this email already exists.' };
      }
    }

    const newUserId = `user-${Date.now()}`;
    const avatarUrl = data.avatar || AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
    const coverUrl = COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)];

    const newUser: User = {
      id: newUserId,
      name: data.name.trim(),
      handle: cleanHandle,
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      avatar: avatarUrl,
      coverPhoto: coverUrl,
      bio: data.bio?.trim() || 'Excited to be on Sphere Social ✨',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isOnline: true,
      friendsCount: 0,
      followersCount: 0,
      verified: false,
      friends: []
    };

    try {
      setDoc(doc(db, 'users', newUserId), newUser);
    } catch (e) {
      console.warn('Firestore user save:', e);
    }

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUserId);
    return { success: true };
  };

  const loginUser = (handleOrEmail: string, password?: string): { success: boolean; error?: string } => {
    const query = handleOrEmail.trim().toLowerCase().replace(/^@/, '');
    const foundUser = users.find(u => 
      u.handle.toLowerCase() === query || 
      (u.email && u.email.toLowerCase() === query)
    );

    if (!foundUser) {
      return { success: false, error: 'No account found with this username or email.' };
    }

    if (password && foundUser.password && foundUser.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentUserId(foundUser.id);
    return { success: true };
  };

  // Login with Google / Gmail (Direct fallback & Firestore sync)
  const loginWithGoogle = (email: string, name?: string, avatar?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid Gmail address.' };
    }

    // Check if user with this email already exists
    const existing = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUserId(existing.id);
      return { success: true };
    }

    // Derive display name from email or parameter
    const emailPrefix = cleanEmail.split('@')[0];
    const derivedName = name?.trim() || emailPrefix
      .split(/[._-]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ') || 'Google User';

    const derivedHandle = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`;
    
    // Check if handle collides, if so append number
    let finalHandle = derivedHandle;
    let counter = 1;
    while (users.some(u => u.handle.toLowerCase() === finalHandle)) {
      finalHandle = `${derivedHandle}${counter}`;
      counter++;
    }

    const newUserId = `user-g-${Date.now()}`;
    const googleAvatar = avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`;
    const coverUrl = COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)];

    const newGoogleUser: User = {
      id: newUserId,
      name: derivedName,
      handle: finalHandle,
      email: cleanEmail,
      avatar: googleAvatar,
      coverPhoto: coverUrl,
      bio: `Signed in via Google (${cleanEmail}) 🌐`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isOnline: true,
      friendsCount: 0,
      followersCount: 0,
      verified: true,
      friends: []
    };

    try {
      setDoc(doc(db, 'users', newUserId), newGoogleUser);
    } catch (e) {
      console.warn('Firestore user save:', e);
    }

    setUsers(prev => [newGoogleUser, ...prev]);
    setCurrentUserId(newUserId);
    return { success: true };
  };

  const loginWithUserId = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    setCurrentUserId(null);
    setActiveConversationId(null);
    setFloatingChats([]);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
  };

  const updateCurrentUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    try {
      setDoc(doc(db, 'users', currentUser.id), updatedUser, { merge: true });
    } catch (e) {
      console.warn('Firestore update note:', e);
    }
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return updatedUser;
      }
      return u;
    }));
  };

  // --- POST OPERATIONS ---
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'sharesCount'>) => {
    if (!currentUser) return;
    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newPost: Post & { timestamp: number } = {
      ...postData,
      id: postId,
      author: currentUser,
      createdAt: 'Just now',
      reactions: { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, fire: 0 },
      comments: [],
      sharesCount: 0,
      timestamp: Date.now()
    };
    
    setPosts(prev => [newPost, ...prev]);

    try {
      const cleanPost = Object.fromEntries(
        Object.entries(newPost).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'posts', postId), cleanPost);
    } catch (e) {
      console.warn('Firestore post save:', e);
    }
  };

  const reactToPost = async (postId: string, reaction: ReactionType) => {
    if (!currentUser) return;
    let targetPost: Post | undefined;

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const currentReaction = post.userReaction;
      const updatedReactions = { ...post.reactions };

      if (currentReaction === reaction) {
        // Untoggle
        updatedReactions[reaction] = Math.max(0, updatedReactions[reaction] - 1);
        targetPost = { ...post, reactions: updatedReactions, userReaction: undefined };
      } else {
        if (currentReaction) {
          updatedReactions[currentReaction] = Math.max(0, updatedReactions[currentReaction] - 1);
        }
        updatedReactions[reaction] = (updatedReactions[reaction] || 0) + 1;
        targetPost = { ...post, reactions: updatedReactions, userReaction: reaction };
      }
      return targetPost;
    }));

    if (targetPost) {
      try {
        const cleanPost = Object.fromEntries(
          Object.entries(targetPost).filter(([_, v]) => v !== undefined)
        );
        await setDoc(doc(db, 'posts', postId), cleanPost, { merge: true });
      } catch (e) {
        console.warn('Firestore react save:', e);
      }
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      content: content.trim(),
      createdAt: 'Just now',
      likesCount: 0
    };

    let updatedPost: Post | undefined;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      updatedPost = { ...p, comments: [...p.comments, newComment] };
      return updatedPost;
    }));

    if (updatedPost) {
      try {
        await setDoc(doc(db, 'posts', postId), updatedPost, { merge: true });
      } catch (e) {
        console.warn('Firestore comment save:', e);
      }
    }
  };

  const likeComment = async (postId: string, commentId: string) => {
    let updatedPost: Post | undefined;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      updatedPost = {
        ...p,
        comments: p.comments.map(c => {
          if (c.id !== commentId) return c;
          const isLiked = c.isLiked;
          return {
            ...c,
            likesCount: isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1,
            isLiked: !isLiked
          };
        })
      };
      return updatedPost;
    }));

    if (updatedPost) {
      try {
        await setDoc(doc(db, 'posts', postId), updatedPost, { merge: true });
      } catch (e) {
        console.warn('Firestore like comment save:', e);
      }
    }
  };

  const sharePost = async (postId: string) => {
    let updatedPost: Post | undefined;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      updatedPost = { ...p, sharesCount: p.sharesCount + 1 };
      return updatedPost;
    }));

    if (updatedPost) {
      try {
        await setDoc(doc(db, 'posts', postId), updatedPost, { merge: true });
      } catch (e) {
        console.warn('Firestore share post save:', e);
      }
    }
  };

  const toggleSavePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, saved: !p.saved };
    }));
  };

  const votePoll = async (postId: string, optionId: string) => {
    if (!currentUser) return;
    let updatedPost: Post | undefined;

    setPosts(prev => prev.map(post => {
      if (post.id !== postId || !post.poll) return post;
      
      const hasVoted = post.poll.options.some(opt => opt.voters.includes(currentUser.id));
      if (hasVoted) return post;

      const newOptions = post.poll.options.map(opt => {
        if (opt.id === optionId) {
          return {
            ...opt,
            votes: opt.votes + 1,
            voters: [...opt.voters, currentUser.id]
          };
        }
        return opt;
      });

      updatedPost = {
        ...post,
        poll: {
          ...post.poll,
          options: newOptions,
          totalVotes: post.poll.totalVotes + 1
        }
      };
      return updatedPost;
    }));

    if (updatedPost) {
      try {
        await setDoc(doc(db, 'posts', postId), updatedPost, { merge: true });
      } catch (e) {
        console.warn('Firestore poll vote save:', e);
      }
    }
  };

  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (e) {
      console.warn('Firestore delete post:', e);
    }
  };

  // --- CHAT & MESSAGING OPERATIONS ---
  const openFloatingChat = (conversationId: string) => {
    if (!floatingChats.includes(conversationId)) {
      setFloatingChats(prev => [...prev.slice(-2), conversationId]);
    }
    setMinimizedChats(prev => ({ ...prev, [conversationId]: false }));
    markConversationAsRead(conversationId);

    if (currentUser) {
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId && c.deletedForUserIds?.includes(currentUser.id)) {
          const updatedDeleted = (c.deletedForUserIds || []).filter(id => id !== currentUser.id);
          try {
            setDoc(doc(db, 'conversations', conversationId), { deletedForUserIds: updatedDeleted }, { merge: true });
          } catch (e) {
            console.warn('Firestore restore in openFloatingChat:', e);
          }
          return { ...c, deletedForUserIds: updatedDeleted };
        }
        return c;
      }));
    }
  };

  const closeFloatingChat = (conversationId: string) => {
    setFloatingChats(prev => prev.filter(id => id !== conversationId));
  };

  const toggleMinimizeChat = (conversationId: string) => {
    setMinimizedChats(prev => ({ ...prev, [conversationId]: !prev[conversationId] }));
    if (minimizedChats[conversationId]) {
      markConversationAsRead(conversationId);
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));
  };

  const deleteMessage = async (conversationId: string, messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).filter(m => m.id !== messageId)
    }));

    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (e) {
      console.warn('Firestore delete message:', e);
    }
  };

  const deleteConversationSecretly = async (conversationId: string) => {
    if (!currentUser) return;
    const now = Date.now();

    // 1. Optimistic state update: hide conversation for currentUser and record clear timestamp
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const currentDeleted = c.deletedForUserIds || [];
      const updatedDeleted = currentDeleted.includes(currentUser.id)
        ? currentDeleted
        : [...currentDeleted, currentUser.id];
      const updatedCleared = {
        ...(c.clearedAtForUsers || {}),
        [currentUser.id]: now
      };
      return {
        ...c,
        deletedForUserIds: updatedDeleted,
        clearedAtForUsers: updatedCleared
      };
    }));

    // Close floating chat
    setFloatingChats(prev => prev.filter(id => id !== conversationId));

    // Clear active conversation if currently open
    setActiveConversationId(prev => (prev === conversationId ? null : prev));

    // 2. Persist to Firestore
    try {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        const currentDeleted = conv.deletedForUserIds || [];
        const updatedDeleted = currentDeleted.includes(currentUser.id)
          ? currentDeleted
          : [...currentDeleted, currentUser.id];
        const updatedCleared = {
          ...(conv.clearedAtForUsers || {}),
          [currentUser.id]: now
        };
        await setDoc(doc(db, 'conversations', conversationId), {
          ...conv,
          deletedForUserIds: updatedDeleted,
          clearedAtForUsers: updatedCleared
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore secret delete conv error:', e);
    }
  };

  const sendMessage = async (
    conversationId: string, 
    content: { 
      text?: string; 
      mediaUrl?: string; 
      mediaType?: 'image' | 'audio' | 'file'; 
      audioDuration?: number; 
      replyTo?: { id: string; text: string; senderName: string };
    }
  ) => {
    if (!currentUser) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const currentConv = conversations.find(c => c.id === conversationId);
    const clearTs = (currentConv?.clearedAtForUsers?.[currentUser.id]) || 0;
    const msgTimestamp = Math.max(Date.now(), clearTs + 1);

    const newMessage: ChatMessage & { timestamp: number } = {
      id: messageId,
      conversationId,
      senderId: currentUser.id,
      text: content.text,
      mediaUrl: content.mediaUrl,
      mediaType: content.mediaType,
      audioDuration: content.audioDuration,
      createdAt: timeStr,
      read: false,
      replyTo: content.replyTo,
      timestamp: msgTimestamp
    };

    // 1. Optimistic local update
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Ensure conversation is unhidden for current user and has fresh lastMessage
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const updatedDeleted = (c.deletedForUserIds || []).filter(id => id !== currentUser.id);
      return {
        ...c,
        deletedForUserIds: updatedDeleted,
        lastMessage: newMessage,
        updatedAt: 'Just now',
        timestamp: msgTimestamp
      } as any;
    }));

    // 2. Persist to Firestore
    try {
      const cleanMsgDoc = Object.fromEntries(
        Object.entries(newMessage).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'messages', messageId), cleanMsgDoc);

      if (currentConv) {
        const updatedDeleted = (currentConv.deletedForUserIds || []).filter(id => id !== currentUser.id);
        const cleanConvDoc = Object.fromEntries(
          Object.entries({
            ...currentConv,
            deletedForUserIds: updatedDeleted,
            lastMessage: cleanMsgDoc,
            updatedAt: 'Just now',
            timestamp: msgTimestamp
          }).filter(([_, v]) => v !== undefined)
        );
        await setDoc(doc(db, 'conversations', conversationId), cleanConvDoc, { merge: true });

        // Direct notification to recipient
        const otherParticipant = currentConv.participants.find(p => p.id !== currentUser.id);
        if (otherParticipant) {
          const notifId = `notif_msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const notifDoc = {
            id: notifId,
            toUserId: otherParticipant.id,
            type: 'message',
            actor: currentUser,
            message: `sent you a message: "${(content.text || 'Shared media').slice(0, 40)}"`,
            createdAt: 'Just now',
            read: false,
            timestamp: Date.now(),
            targetId: conversationId
          };
          await setDoc(doc(db, 'notifications', notifId), notifDoc);
        }
      }
    } catch (e) {
      console.warn('Firestore message save error:', e);
    }
  };

  const reactToMessage = async (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    let updatedMessage: ChatMessage | undefined;

    setMessages(prev => {
      const convMessages = prev[conversationId] || [];
      const updated = convMessages.map(msg => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const existingIndex = currentReactions.findIndex(r => r.userId === currentUser.id && r.emoji === emoji);
        
        let newReactions;
        if (existingIndex > -1) {
          newReactions = currentReactions.filter((_, i) => i !== existingIndex);
        } else {
          newReactions = [
            ...currentReactions.filter(r => r.userId !== currentUser.id),
            { userId: currentUser.id, emoji }
          ];
        }
        updatedMessage = { ...msg, reactions: newReactions };
        return updatedMessage;
      });
      return { ...prev, [conversationId]: updated };
    });

    if (updatedMessage) {
      try {
        const cleanMsg = Object.fromEntries(
          Object.entries(updatedMessage).filter(([_, v]) => v !== undefined)
        );
        await setDoc(doc(db, 'messages', messageId), cleanMsg, { merge: true });
      } catch (e) {
        console.warn('Firestore react message save:', e);
      }
    }
  };

  const startDirectChat = (targetUser: User): string => {
    if (!currentUser || targetUser.id === currentUser.id) return '';
    
    // Always get latest fresh user objects
    const freshCurrentUser = users.find(u => u.id === currentUser.id) || currentUser;
    const freshTargetUser = users.find(u => u.id === targetUser.id) || targetUser;

    const deterministicId = `direct_${[freshCurrentUser.id, freshTargetUser.id].sort().join('___')}`;

    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.id === deterministicId ||
      (!c.isGroup && (
        (c.participantIds?.includes(freshCurrentUser.id) && c.participantIds?.includes(freshTargetUser.id)) ||
        (c.participants?.some(p => p.id === freshCurrentUser.id) && c.participants?.some(p => p.id === freshTargetUser.id))
      ))
    );

    if (existing) {
      const updatedDeleted = (existing.deletedForUserIds || []).filter(id => id !== freshCurrentUser.id);
      const updatedConv: Conversation = { 
        ...existing, 
        deletedForUserIds: updatedDeleted,
        participants: [freshCurrentUser, freshTargetUser],
        participantIds: [freshCurrentUser.id, freshTargetUser.id]
      };
      setConversations(prev => prev.map(c => c.id === existing.id ? updatedConv : c));
      try {
        setDoc(doc(db, 'conversations', existing.id), { 
          deletedForUserIds: updatedDeleted,
          participants: [freshCurrentUser, freshTargetUser],
          participantIds: [freshCurrentUser.id, freshTargetUser.id]
        }, { merge: true });
      } catch (e) {
        console.warn('Restore conv on startDirectChat:', e);
      }
      openFloatingChat(existing.id);
      setActiveConversationId(existing.id);
      markConversationAsRead(existing.id);
      return existing.id;
    }

    // Create new direct conversation
    const newConv: Conversation & { timestamp: number } = {
      id: deterministicId,
      isGroup: false,
      participantIds: [freshCurrentUser.id, freshTargetUser.id],
      participants: [freshCurrentUser, freshTargetUser],
      unreadCount: 0,
      updatedAt: 'Just now',
      timestamp: Date.now(),
      deletedForUserIds: []
    };

    setConversations(prev => [newConv, ...prev.filter(c => c.id !== deterministicId)]);
    setMessages(prev => ({ ...prev, [deterministicId]: prev[deterministicId] || [] }));
    openFloatingChat(deterministicId);
    setActiveConversationId(deterministicId);

    try {
      setDoc(doc(db, 'conversations', deterministicId), newConv, { merge: true });
    } catch (e) {
      console.warn('Firestore startDirectChat save:', e);
    }

    return deterministicId;
  };

  const createGroupChat = (name: string, participantUserIds: string[]): string => {
    if (!currentUser) return '';
    const allParticipantIds = Array.from(new Set([currentUser.id, ...participantUserIds]));
    const participantsList = users.filter(u => allParticipantIds.includes(u.id));
    
    const newConvId = `group_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newGroupConv: Conversation & { timestamp: number } = {
      id: newConvId,
      isGroup: true,
      name: name || 'Group Chat',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80',
      participantIds: allParticipantIds,
      participants: participantsList,
      unreadCount: 0,
      updatedAt: 'Just now',
      timestamp: Date.now()
    };

    setConversations(prev => [newGroupConv, ...prev]);
    openFloatingChat(newConvId);
    setActiveConversationId(newConvId);

    try {
      setDoc(doc(db, 'conversations', newConvId), newGroupConv);
    } catch (e) {
      console.warn('Firestore group conv save:', e);
    }

    return newConvId;
  };

  // --- NOTIFICATION OPERATIONS ---
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // --- FRIEND MANAGEMENT ---
  const getFriendStatus = (targetUserId: string): FriendStatusType => {
    if (!currentUser || targetUserId === currentUser.id) return 'none';
    
    // Check if already friends
    const isAlreadyFriend = currentUser.friends?.includes(targetUserId);
    if (isAlreadyFriend) return 'friends';

    // Check outgoing pending request
    const sentPending = friendRequests.some(r => 
      r.fromUser.id === currentUser.id && 
      r.toUserId === targetUserId && 
      r.status === 'pending'
    );
    if (sentPending) return 'sent_pending';

    // Check incoming pending request
    const receivedPending = friendRequests.some(r => 
      r.fromUser.id === targetUserId && 
      r.toUserId === currentUser.id && 
      r.status === 'pending'
    );
    if (receivedPending) return 'received_pending';

    return 'none';
  };

  const sendFriendRequest = async (toUserId: string) => {
    if (!currentUser || toUserId === currentUser.id) return;
    const target = users.find(u => u.id === toUserId);
    if (!target) return;

    // Check if request already exists
    const existing = friendRequests.find(r => 
      r.fromUser.id === currentUser.id && 
      r.toUserId === toUserId && 
      r.status === 'pending'
    );
    if (existing) return;

    const reqId = `fr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newReq: FriendRequest & { timestamp: number } = {
      id: reqId,
      fromUser: currentUser,
      toUserId,
      status: 'pending',
      mutualFriendsCount: 0,
      createdAt: 'Just now',
      timestamp: Date.now()
    };

    setFriendRequests(prev => [newReq, ...prev]);

    try {
      await setDoc(doc(db, 'friendRequests', reqId), newReq);

      // Send notification to target in Firestore
      const notifId = `notif_fr_${Date.now()}`;
      const newNotif = {
        id: notifId,
        toUserId,
        type: 'friend_request',
        actor: currentUser,
        message: 'sent you a friend request on Sphere',
        createdAt: 'Just now',
        read: false,
        timestamp: Date.now()
      };
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (e) {
      console.warn('Firestore send friend request:', e);
    }
  };

  const cancelFriendRequest = async (toUserId: string) => {
    if (!currentUser) return;
    const matchingReq = friendRequests.find(r => r.fromUser.id === currentUser.id && r.toUserId === toUserId);
    setFriendRequests(prev => prev.filter(r => !(r.fromUser.id === currentUser.id && r.toUserId === toUserId)));

    if (matchingReq) {
      try {
        await deleteDoc(doc(db, 'friendRequests', matchingReq.id));
      } catch (e) {
        console.warn('Firestore cancel friend request:', e);
      }
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req || !currentUser) return;

    // Remove request from pending
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));

    const senderId = req.fromUser.id;
    const receiverId = currentUser.id;

    const updatedReceiverFriends = currentUser.friends?.includes(senderId) 
      ? currentUser.friends 
      : [...(currentUser.friends || []), senderId];

    const senderUser = users.find(u => u.id === senderId);
    const updatedSenderFriends = senderUser?.friends?.includes(receiverId)
      ? senderUser.friends
      : [...(senderUser?.friends || []), receiverId];

    setUsers(prev => prev.map(u => {
      if (u.id === receiverId) {
        return { ...u, friends: updatedReceiverFriends, friendsCount: updatedReceiverFriends.length };
      }
      if (u.id === senderId) {
        return { ...u, friends: updatedSenderFriends, friendsCount: updatedSenderFriends.length };
      }
      return u;
    }));

    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
      await setDoc(doc(db, 'users', receiverId), { friends: updatedReceiverFriends, friendsCount: updatedReceiverFriends.length }, { merge: true });
      await setDoc(doc(db, 'users', senderId), { friends: updatedSenderFriends, friendsCount: updatedSenderFriends.length }, { merge: true });

      const notifId = `notif_fa_${Date.now()}`;
      const newNotif = {
        id: notifId,
        toUserId: senderId,
        type: 'friend_accept',
        actor: currentUser,
        message: 'is now connected as your friend on Sphere! 🎉',
        createdAt: 'Just now',
        read: false,
        timestamp: Date.now()
      };
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (e) {
      console.warn('Firestore accept friend request:', e);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
    } catch (e) {
      console.warn('Firestore decline friend request:', e);
    }
  };

  const removeFriend = async (targetUserId: string) => {
    if (!currentUser) return;
    const newReceiverFriends = (currentUser.friends || []).filter(id => id !== targetUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    const newTargetFriends = (targetUser?.friends || []).filter(id => id !== currentUser.id);

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, friends: newReceiverFriends, friendsCount: newReceiverFriends.length };
      }
      if (u.id === targetUserId) {
        return { ...u, friends: newTargetFriends, friendsCount: newTargetFriends.length };
      }
      return u;
    }));

    try {
      await setDoc(doc(db, 'users', currentUser.id), { friends: newReceiverFriends, friendsCount: newReceiverFriends.length }, { merge: true });
      await setDoc(doc(db, 'users', targetUserId), { friends: newTargetFriends, friendsCount: newTargetFriends.length }, { merge: true });
    } catch (e) {
      console.warn('Firestore remove friend:', e);
    }
  };

  const isFriend = (userId: string) => {
    return getFriendStatus(userId) === 'friends';
  };

  const startCall = (conversationId: string, isVideo: boolean = false) => {
    if (!currentUser) return;
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;
    const otherUser = conv.isGroup ? undefined : conv.participants.find(p => p.id !== currentUser.id);
    setActiveCall({
      conversationId,
      user: otherUser,
      isGroup: conv.isGroup,
      isVideo
    });
  };

  const endCall = () => {
    setActiveCall(null);
  };

  const unreadMessagesTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadNotificationsTotal = notifications.filter(n => {
    const isForMe = !n.toUserId || (currentUser && n.toUserId === currentUser.id);
    return isForMe && !n.read;
  }).length;

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users,
        registerUser,
        loginUser,
        loginWithGoogleFirebase,
        loginWithGoogle,
        loginWithUserId,
        logout,
        setCurrentUser,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedProfileUser,
        setSelectedProfileUser,
        updateCurrentUserProfile,
        posts,
        addPost,
        reactToPost,
        addComment,
        likeComment,
        sharePost,
        toggleSavePost,
        votePoll,
        deletePost,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        floatingChats,
        openFloatingChat,
        closeFloatingChat,
        minimizedChats,
        toggleMinimizeChat,
        sendMessage,
        reactToMessage,
        deleteMessage,
        deleteConversationSecretly,
        markConversationAsRead,
        startDirectChat,
        createGroupChat,
        unreadMessagesTotal,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsTotal,
        friendRequests,
        getFriendStatus,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        removeFriend,
        isFriend,
        activeCall,
        startCall,
        endCall
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

