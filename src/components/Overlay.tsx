import React from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, SkipForward, MessageCircle, ArrowRight, Globe } from 'lucide-react';

export const Overlay: React.FC = () => {
  const { learningPoints, isPlaying, setIsPlaying, savePoint, openChat, isFloating } = useStore();
  const currentPoint = learningPoints[learningPoints.length - 1];

  if (isPlaying || !currentPoint) return null;

  const handleSkip = () => {
    setIsPlaying(true);
  };

  const handleSave = () => {
    savePoint(currentPoint);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`absolute ${isFloating ? '-bottom-4 left-1/2 transform -translate-x-1/2 translate-y-full w-[440px] p-4 max-h-[400px] overflow-y-auto' : 'bottom-10 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl p-6'} bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-50 text-slate-200 cursor-default custom-scrollbar`}
        onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when interacting with overlay
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
              currentPoint.type === 'grammar_correction' ? 'bg-rose-500/20 text-rose-300' :
              currentPoint.type === 'authentic_replacement' ? 'bg-emerald-500/20 text-emerald-300' :
              'bg-indigo-500/20 text-indigo-300'
            }`}>
              {currentPoint.type.replace('_', ' ')}
            </span>
            <h2 className={`${isFloating ? 'text-lg' : 'text-2xl'} font-bold text-white`}>{currentPoint.content}</h2>
          </div>
          <button onClick={handleSkip} className="text-slate-400 hover:text-white transition-colors shrink-0 ml-4">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Correction / Replacement UI */}
          {currentPoint.originalText && currentPoint.correctedText && (
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-rose-400 line-through opacity-80 shrink-0 mt-0.5">Original:</span>
                <span className="text-rose-300">{currentPoint.originalText}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-emerald-400 font-medium shrink-0 mt-0.5 flex items-center gap-1">
                  <ArrowRight size={14} /> Better:
                </span>
                <span className="text-emerald-300 font-medium">{currentPoint.correctedText}</span>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Explanation</h3>
            <p className={`${isFloating ? 'text-xs' : 'text-sm'} leading-relaxed`}>{currentPoint.explanation}</p>
          </div>

          {/* UK vs US Differences */}
          {currentPoint.ukUsDifference && (
            <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20">
              <h3 className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                <Globe size={12} /> UK vs US
              </h3>
              <p className={`${isFloating ? 'text-xs' : 'text-sm'} leading-relaxed text-indigo-200`}>{currentPoint.ukUsDifference}</p>
            </div>
          )}

          {!isFloating && (
            <>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 mb-1">TV Show Example</h3>
                <p className="text-sm italic text-emerald-400">"{currentPoint.example}"</p>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 mb-1">Current Subtitle</h3>
                <p className="text-sm text-slate-300">{currentPoint.subtitle || 'Subtitles not available'}</p>
              </div>
            </>
          )}
        </div>

        <div className={`flex justify-end gap-2 mt-4 ${isFloating ? 'flex-wrap' : ''}`}>
          <button
            onClick={() => openChat(currentPoint)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-xs font-medium"
          >
            <MessageCircle size={14} />
            Ask AI
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <SkipForward size={14} />
            Resume
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
