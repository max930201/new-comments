import React, { useState } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface GuestbookViewProps {
  messages: Message[];
  onMessageAdded: () => void;
}

const GuestbookView: React.FC<GuestbookViewProps> = ({ messages, onMessageAdded }) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 刪除確認彈窗狀態
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 僅顯示前台未被標記為刪除的留言
  const activeMessages = messages.filter(m => !m.isDeleted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const analysis = await geminiService.analyzeMessage(content);

      const newMessage: Message = {
        id: storageService.generateId(),
        author: author.trim(),
        content: content.trim(),
        timestamp: Date.now(),
        sentiment: analysis.sentiment as any,
        aiAnalysis: analysis.analysis,
        isDeleted: false,
      };

      storageService.addMessage(newMessage);
      setAuthor('');
      setContent('');
      onMessageAdded();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      storageService.deleteMessage(deletingId);
      setDeletingId(null);
      onMessageAdded(); // 立即重新載入資料，留言會從 activeMessages 中消失
    }
  };

  const startEditing = (msg: Message) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  };

  const handleUpdate = () => {
    if (!editingId || !editValue.trim()) return;
    storageService.updateMessage(editingId, editValue.trim());
    setEditingId(null);
    onMessageAdded();
  };

  const getSentimentTag = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return '✨ 暖心';
      case 'Negative': return '🌧️ 憂鬱';
      default: return '☁️ 日常';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-rose-500 bg-rose-50';
      case 'Negative': return 'text-slate-500 bg-slate-50';
      default: return 'text-pink-400 bg-pink-50';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 自定義刪除確認視窗 (Modal) */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full border border-pink-100 animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-50 rounded-full opacity-50"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">🌸</div>
              <h3 className="text-xl font-black text-pink-700 mb-2">確定要刪除嗎？</h3>
              <p className="text-pink-400 text-sm font-medium mb-8">
                這則留言將從前台移除。<br/>管理員後台仍會保留紀錄。
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95"
                >
                  是的，確定刪除
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full py-3 bg-pink-50 text-pink-400 rounded-2xl font-bold hover:bg-pink-100 transition-all"
                >
                  先不要，取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-black text-pink-600 drop-shadow-sm">🌷 暖心留言板 🌷</h1>
        <p className="text-pink-400 font-medium text-lg text-center">留下你美好的足跡 🌸</p>
      </div>

      <section className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(255,182,193,0.3)] border border-pink-50 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span className="text-6xl">🌸</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-pink-400 ml-2">你的名字</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="怎麼稱呼你呢？"
              className="w-full px-5 py-3 rounded-2xl border-2 border-pink-50 focus:border-pink-300 focus:ring-0 transition-all outline-none bg-pink-50/30 font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-pink-400 ml-2">想說的話</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的心情或是想說的話..."
              rows={4}
              className="w-full px-5 py-3 rounded-2xl border-2 border-pink-50 focus:border-pink-300 focus:ring-0 transition-all outline-none resize-none bg-pink-50/30 font-medium"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${
              isSubmitting ? 'bg-pink-200 cursor-not-allowed' : 'bg-[#ff8da1] hover:bg-[#ff5775] shadow-pink-200'
            }`}
          >
            {isSubmitting ? '傳送中...' : '送出留言 🌸'}
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {activeMessages.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/40 rounded-[2rem] border-2 border-dashed border-pink-200">
            <p className="text-pink-300 font-bold text-lg italic">還沒有人留言喔... 搶個頭香吧！ 🐾</p>
          </div>
        ) : (
          activeMessages.map((msg) => (
            <div key={msg.id} className="bg-white/90 backdrop-blur-sm rounded-3xl border border-pink-50 p-6 shadow-sm hover:shadow-md transition-all group relative">
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-black">
                      {msg.author[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-pink-700">{msg.author}</h3>
                      <p className="text-[10px] font-medium text-pink-300">
                        {new Date(msg.timestamp).toLocaleString()}
                        {msg.lastModified && <span className="ml-1 text-rose-300">(已編輯)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => startEditing(msg)}
                      className="p-1.5 text-pink-300 hover:text-pink-500 transition-colors"
                      title="編輯內容"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setDeletingId(msg.id)}
                      className="p-1.5 text-rose-300 hover:text-rose-500 transition-colors"
                      title="刪除此留言"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {editingId === msg.id ? (
                  <div className="space-y-2 py-2">
                    <textarea 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-pink-100 focus:border-pink-300 outline-none text-sm text-gray-600 bg-pink-50/20"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => setEditingId(null)} className="text-xs font-bold text-pink-300 px-3 py-1">取消</button>
                      <button onClick={handleUpdate} className="text-xs font-bold bg-pink-500 text-white px-3 py-1 rounded-lg">更新</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium mb-4">{msg.content}</p>
                )}

                <div className="flex justify-between items-center">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSentimentColor(msg.sentiment)}`}>
                      {getSentimentTag(msg.sentiment)}
                   </span>
                </div>
                
                {msg.replies && msg.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-4 border-pink-100 space-y-2 bg-pink-50/30 p-3 rounded-r-2xl">
                    {msg.replies.map(reply => (
                      <div key={reply.id} className="text-sm">
                        <span className="font-black text-pink-500 text-[10px] uppercase block">管理員回覆</span>
                        <p className="text-pink-600 italic">「{reply.content}」</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default GuestbookView;