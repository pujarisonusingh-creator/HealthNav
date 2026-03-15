import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, MapPin, Clock, Navigation, Trash2, Loader2 } from 'lucide-react';
import { SearchHistory } from '../types';

export default function HistoryScreen() {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      setHistory(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">History</h1>
          <p className="text-slate-400 text-sm font-medium">Your recent searches</p>
        </div>
        {history.length > 0 && (
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            {history.length} entries
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              key={item.id}
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
            >
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-slate-400 shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">
                  {item.address || 'Location Search'}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock size={11} />
                  {formatTime(item.timestamp)}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-slate-900 text-white p-2.5 rounded-xl active:scale-95 transition-all"
                aria-label="Open in maps"
              >
                <Navigation size={15} />
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-300">
          <HistoryIcon size={52} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold text-slate-400">No search history yet</p>
          <p className="text-xs text-slate-300 mt-1">Your location searches will appear here</p>
        </div>
      )}
    </div>
  );
}
