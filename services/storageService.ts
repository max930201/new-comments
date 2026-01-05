
import { Message } from '../types';

const STORAGE_KEY = 'guestbook_messages_v1';

export const storageService = {
  getMessages: (includeDeleted: boolean = true): Message[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    const messages: Message[] = data ? JSON.parse(data) : [];
    if (!includeDeleted) {
      return messages.filter(m => !m.isDeleted);
    }
    return messages;
  },
  
  saveMessages: (messages: Message[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  },

  addMessage: (message: Message): void => {
    const messages = storageService.getMessages();
    storageService.saveMessages([message, ...messages]);
  },

  deleteMessage: (id: string): void => {
    const messages = storageService.getMessages();
    const updated = messages.map(m => m.id === id ? { ...m, isDeleted: true } : m);
    storageService.saveMessages(updated);
  },

  hardDeleteMessage: (id: string): void => {
    const messages = storageService.getMessages();
    const updated = messages.filter(m => m.id !== id);
    storageService.saveMessages(updated);
  },

  restoreMessage: (id: string): void => {
    const messages = storageService.getMessages();
    const updated = messages.map(m => m.id === id ? { ...m, isDeleted: false } : m);
    storageService.saveMessages(updated);
  },

  updateMessage: (id: string, newContent: string): void => {
    const messages = storageService.getMessages();
    const updated = messages.map(m => m.id === id ? { ...m, content: newContent, lastModified: Date.now() } : m);
    storageService.saveMessages(updated);
  },

  generateId: (): string => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
  }
};
