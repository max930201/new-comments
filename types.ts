
export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  lastModified?: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Unknown';
  aiAnalysis?: string;
  isDeleted: boolean;
  replies?: MessageReply[];
}

export interface MessageReply {
  id: string;
  content: string;
  timestamp: number;
  author: string;
}

export enum ViewMode {
  GUESTBOOK = 'guestbook',
  ADMIN = 'admin'
}
