export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'fire';

export type FriendStatusType = 'none' | 'friends' | 'sent_pending' | 'received_pending';

export interface User {
  id: string;
  name: string;
  handle: string;
  email?: string;
  password?: string;
  avatar: string;
  coverPhoto: string;
  bio: string;
  location?: string;
  work?: string;
  education?: string;
  website?: string;
  joinedDate: string;
  isOnline: boolean;
  lastActive?: string;
  friendsCount: number;
  followersCount: number;
  verified?: boolean;
  friends?: string[];
}

export interface PostComment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  userLiked?: boolean;
  replies?: PostComment[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface PostPoll {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  feeling?: { emoji: string; label: string };
  location?: string;
  audience: 'public' | 'friends' | 'only_me';
  createdAt: string;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
  comments: PostComment[];
  sharesCount: number;
  saved?: boolean;
  poll?: PostPoll;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
  audioDuration?: number;
  createdAt: string;
  read: boolean;
  timestamp?: number;
  reactions?: MessageReaction[];
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
  typingUsers?: string[];
  deletedForUserIds?: string[];
  clearedAtForUsers?: Record<string, number>;
}

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'message' 
  | 'friend_request' 
  | 'friend_accept' 
  | 'mention';

export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: User;
  targetId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  fromUser: User;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  mutualFriendsCount: number;
  createdAt: string;
}

export type ActiveTab = 'feed' | 'messenger' | 'friends' | 'saved' | 'profile';

