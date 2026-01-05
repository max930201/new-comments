
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import GuestbookView from './components/GuestbookView';
import AdminDashboard from './components/AdminDashboard';
import { ViewMode, Message } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.GUESTBOOK);
  const [messages, setMessages] = useState<Message[]>([]);

  const loadMessages = useCallback(() => {
    const data = storageService.getMessages();
    setMessages(data);
  }, []);

  useEffect(() => {
    loadMessages();
    // Simulate real-time polling or simple interval update
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <div className="animate-in fade-in duration-700">
        {activeView === ViewMode.GUESTBOOK ? (
          <GuestbookView 
            messages={messages} 
            onMessageAdded={loadMessages} 
          />
        ) : (
          <AdminDashboard 
            messages={messages} 
            onDataChange={loadMessages} 
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
