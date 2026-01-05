
import React from 'react';
import { ViewMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-pink-400 p-2 rounded-xl shadow-sm">
                <span className="text-xl">🌷</span>
              </div>
              <span className="text-xl font-bold text-pink-600 tracking-tight">花漾留言板</span>
            </div>
            
            <div className="flex space-x-2 bg-pink-50 p-1 rounded-xl">
              <button
                onClick={() => onViewChange(ViewMode.GUESTBOOK)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeView === ViewMode.GUESTBOOK
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-pink-300 hover:text-pink-500 hover:bg-white/50'
                }`}
              >
                看留言
              </button>
              <button
                onClick={() => onViewChange(ViewMode.ADMIN)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeView === ViewMode.ADMIN
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-pink-300 hover:text-pink-500 hover:bg-white/50'
                }`}
              >
                後台管理
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {children}
      </main>

      <footer className="py-8 text-center text-pink-300 text-sm font-medium">
        🌸 願你今天也有個美好的一天 🌸
      </footer>
    </div>
  );
};

export default Layout;
