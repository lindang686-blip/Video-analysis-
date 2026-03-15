import React from 'react';
import { useStore, LearningPoint } from '../store';
import { motion } from 'motion/react';
import { Bookmark, MessageCircle, CheckCircle, ArrowRight, Globe } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { savedPoints, openChat, markAsLearned } = useStore();

  const groupedPoints = savedPoints.reduce((acc, point) => {
    if (!acc[point.type]) acc[point.type] = [];
    acc[point.type].push(point);
    return acc;
  }, {} as Record<string, LearningPoint[]>);

  return (
    <div className="w-96 h-full bg-slate-900 border-l border-slate-800 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar shrink-0">
      <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2 sticky top-0 bg-slate-900 z-10 py-2">
        <Bookmark className="text-indigo-400" />
        Saved Points
      </h2>

      {savedPoints.length === 0 ? (
        <p className="text-slate-500 text-sm text-center mt-10">No points saved yet. Watch a video and save some points!</p>
      ) : (
        Object.entries(groupedPoints).map(([type, points]) => (
          <div key={type} className="mb-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {type.replace('_', ' ')}
            </h3>
            <div className="flex flex-col gap-3">
              {points.map((point) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-slate-800/50 border ${point.isLearned ? 'border-emerald-500/30' : 'border-slate-700'} rounded-xl p-4 flex flex-col gap-2`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-slate-200">{point.content}</h4>
                    {point.isLearned && <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />}
                  </div>

                  {point.originalText && point.correctedText && (
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 flex flex-col gap-1 mt-1">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-rose-400 line-through opacity-80 shrink-0">Original:</span>
                        <span className="text-rose-300">{point.originalText}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-400 font-medium shrink-0 flex items-center gap-1">
                          <ArrowRight size={12} /> Better:
                        </span>
                        <span className="text-emerald-300 font-medium">{point.correctedText}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-400 mt-1 line-clamp-3">{point.explanation}</p>
                  
                  {point.ukUsDifference && (
                    <div className="bg-indigo-900/20 p-2 rounded-lg border border-indigo-500/20 mt-1">
                      <h5 className="text-[10px] font-semibold text-indigo-400 mb-0.5 flex items-center gap-1">
                        <Globe size={10} /> UK vs US
                      </h5>
                      <p className="text-xs text-indigo-200 line-clamp-2">{point.ukUsDifference}</p>
                    </div>
                  )}

                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 mt-1">
                    <p className="text-xs italic text-emerald-400">"{point.example}"</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-700/50">
                    <button
                      onClick={() => openChat(point)}
                      className="text-xs flex items-center gap-1.5 px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition-colors font-medium"
                    >
                      <MessageCircle size={14} />
                      Ask AI
                    </button>
                    {!point.isLearned && (
                      <button
                        onClick={() => markAsLearned(point.id)}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle size={14} />
                        Mark Learned
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
