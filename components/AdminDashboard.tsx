
import React, { useState, useMemo } from 'react';
import { Message } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  messages: Message[];
  onDataChange: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ messages, onDataChange }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Modals state
  const [deletingId, setDeletingId] = useState<{id: string, hard: boolean} | null>(null);

  const stats = useMemo(() => {
    const active = messages.filter(m => !m.isDeleted);
    const deleted = messages.filter(m => m.isDeleted);
    const sentimentCounts = active.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: messages.length,
      active: active.length,
      deleted: deleted.length,
      chartData: [
        { name: '暖心', count: sentimentCounts['Positive'] || 0, color: '#fb7185' },
        { name: '日常', count: sentimentCounts['Neutral'] || 0, color: '#f9a8d4' },
        { name: '憂鬱', count: sentimentCounts['Negative'] || 0, color: '#94a3b8' },
      ]
    };
  }, [messages]);

  const confirmDelete = () => {
    if (!deletingId) return;
    if (deletingId.hard) {
      storageService.hardDeleteMessage(deletingId.id);
    } else {
      storageService.deleteMessage(deletingId.id);
    }
    setDeletingId(null);
    onDataChange();
  };

  const handleRestore = (id: string) => {
    storageService.restoreMessage(id);
    onDataChange();
  };

  const handleAICompose = async (msg: Message) => {
    setIsGenerating(true);
    const suggestion = await geminiService.generateAdminReply(msg.content, msg.author);
    setReplyText(suggestion || '');
    setIsGenerating(false);
  };

  const submitReply = (id: string) => {
    if (!replyText.trim()) return;
    const allMessages = storageService.getMessages();
    const updated = allMessages.map(m => {
      if (m.id === id) {
        const replies = m.replies || [];
        return {
          ...m,
          replies: [...replies, {
            id: storageService.generateId(),
            content: replyText,
            timestamp: Date.now(),
            author: 'Admin'
          }]
        };
      }
      return m;
    });
    storageService.saveMessages(updated);
    setReplyingTo(null);
    setReplyText('');
    onDataChange();
  };

  const startAdminEditing = (msg: Message) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  };

  const saveAdminEdit = () => {
    if (!editingId || !editValue.trim()) return;
    storageService.updateMessage(editingId, editValue.trim());
    setEditingId(null);
    onDataChange();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Admin Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pink-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full border border-pink-100 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-5xl mb-4">{deletingId.hard ? '⚠️' : '🌸'}</div>
              <h3 className="text-xl font-black text-pink-700 mb-2">
                {deletingId.hard ? '確定永久刪除？' : '確定要刪除嗎？'}
              </h3>
              <p className="text-pink-400 text-sm font-medium mb-8">
                {deletingId.hard 
                  ? '注意：此動作將永久移除留言，且無法恢復！' 
                  : '這將從前台隱藏此留言，您之後仍可在此恢復顯示。'}
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={confirmDelete}
                  className={`w-full py-3 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${deletingId.hard ? 'bg-rose-600 hover:bg-rose-700' : 'bg-pink-500 hover:bg-pink-600'}`}
                >
                  確認執行
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">⚙️</span>
          <div>
            <h2 className="text-2xl font-bold text-pink-700">管理中心</h2>
            <p className="text-pink-400 text-sm font-medium">查看所有留言紀錄，管理前台顯示狀態。</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 p-6 rounded-3xl border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-bold text-pink-300 uppercase mb-1">總留言數</p>
          <p className="text-4xl font-black text-pink-600">{stats.total}</p>
        </div>
        <div className="bg-white/70 p-6 rounded-3xl border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-bold text-pink-300 uppercase mb-1">前台顯示中</p>
          <p className="text-4xl font-black text-rose-500">{stats.active}</p>
        </div>
        <div className="bg-white/70 p-6 rounded-3xl border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-bold text-pink-300 uppercase mb-1">已刪除隱藏</p>
          <p className="text-4xl font-black text-slate-400">{stats.deleted}</p>
        </div>
      </div>

      <div className="bg-white/80 p-8 rounded-3xl border border-pink-50 shadow-sm">
        <h3 className="text-lg font-bold text-pink-700 mb-6 flex items-center">
          <span className="mr-2">📝</span> 留言深度管理
        </h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`p-5 rounded-2xl border transition-all ${msg.isDeleted ? 'bg-slate-50 border-slate-200' : 'bg-pink-50/20 border-pink-100 hover:bg-pink-50/40'}`}>
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <div className="text-sm">
                  <span className={`font-black ${msg.isDeleted ? 'text-slate-500' : 'text-pink-600'}`}>{msg.author}</span>
                  <span className="text-slate-400 text-[10px] ml-2 font-bold">
                    {new Date(msg.timestamp).toLocaleString()}
                    {msg.isDeleted && <span className="ml-2 text-rose-400">[已隱藏]</span>}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {!msg.isDeleted ? (
                    <>
                      <button onClick={() => startAdminEditing(msg)} className="text-[11px] font-bold text-pink-500 hover:bg-pink-100 px-3 py-1 rounded-lg">編輯</button>
                      <button onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)} className="text-[11px] font-bold text-pink-500 hover:bg-pink-100 px-3 py-1 rounded-lg">回覆</button>
                      <button onClick={() => setDeletingId({id: msg.id, hard: false})} className="text-[11px] font-bold text-rose-400 hover:bg-rose-100 px-3 py-1 rounded-lg">刪除</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleRestore(msg.id)} className="text-[11px] font-bold text-emerald-500 hover:bg-emerald-100 px-3 py-1 rounded-lg">恢復</button>
                      <button onClick={() => setDeletingId({id: msg.id, hard: true})} className="text-[11px] font-bold text-rose-500 hover:bg-rose-100 px-3 py-1 rounded-lg">永久刪除</button>
                    </>
                  )}
                </div>
              </div>

              {editingId === msg.id ? (
                <div className="mt-2 space-y-2">
                  <textarea 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-sm p-3 border-2 border-pink-100 rounded-xl focus:border-pink-300 outline-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-400">取消</button>
                    <button onClick={saveAdminEdit} className="text-xs bg-pink-500 text-white px-4 py-1.5 rounded-xl">儲存</button>
                  </div>
                </div>
              ) : (
                <p className={`text-sm leading-relaxed mb-3 ${msg.isDeleted ? 'text-slate-400 italic' : 'text-pink-900'}`}>{msg.content}</p>
              )}

              {replyingTo === msg.id && (
                <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-pink-100 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-pink-700">快速回覆</span>
                    <button onClick={() => handleAICompose(msg)} disabled={isGenerating} className="text-[10px] bg-rose-50 text-rose-500 font-bold px-2 py-1 rounded-full">{isGenerating ? '思考中...' : '✨ AI 助手'}</button>
                  </div>
                  <textarea 
                    className="w-full text-sm p-3 border border-pink-100 rounded-xl mb-3 outline-none"
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="輸入回覆..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setReplyingTo(null)} className="text-xs text-slate-400 px-3">取消</button>
                    <button onClick={() => submitReply(msg.id)} className="text-xs bg-pink-500 text-white px-4 py-1.5 rounded-xl">送出</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && <p className="text-center py-10 text-pink-200 italic">尚無任何資料庫紀錄 🍵</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
