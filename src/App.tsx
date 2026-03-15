import React, { useState } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { Overlay } from './components/Overlay';
import { Sidebar } from './components/Sidebar';
import { ChatModal } from './components/ChatModal';
import { Dashboard } from './components/Dashboard';
import { useStore } from './store';
import { LayoutDashboard, Upload, Link as LinkIcon, PictureInPicture2, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const { showDashboard, setShowDashboard, setVideoUrl, isFloating, setIsFloating } = useStore();
  const [urlInput, setUrlInput] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setVideoUrl(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">EngSync</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <form onSubmit={handleUrlSubmit} className="flex items-center bg-slate-800 rounded-xl overflow-hidden border border-slate-700 focus-within:border-indigo-500 transition-colors">
              <div className="pl-3 text-slate-400">
                <LinkIcon size={16} />
              </div>
              <input
                type="text"
                placeholder="Paste YouTube or video URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="bg-transparent border-none px-3 py-2 text-sm text-slate-200 focus:outline-none w-64 placeholder-slate-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-medium transition-colors">
                Load
              </button>
            </form>

            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors text-sm font-medium border border-slate-700">
                <Upload size={16} />
                Local Video
              </button>
            </div>

            <button
              onClick={() => setIsFloating(!isFloating)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium border ${isFloating ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}`}
            >
              {isFloating ? <Maximize2 size={16} /> : <PictureInPicture2 size={16} />}
              {isFloating ? 'Exit Float' : 'Float Mode'}
            </button>

            <button
              onClick={() => setShowDashboard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-sm font-medium shadow-lg shadow-emerald-500/20"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative p-6 flex flex-col items-center justify-center overflow-hidden">
          {isFloating && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col gap-4">
              <PictureInPicture2 size={64} className="opacity-20" />
              <p className="text-lg font-medium">Video is playing in floating mode.</p>
              <p className="text-sm">You can drag the video window around or open the Dashboard to review.</p>
            </div>
          )}
          
          <motion.div
            drag={isFloating}
            dragMomentum={false}
            dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
            className={`
              ${isFloating 
                ? 'fixed bottom-8 right-[340px] w-[480px] z-50 shadow-2xl rounded-2xl overflow-visible cursor-move ring-4 ring-indigo-500/30 bg-black' 
                : 'w-full max-w-5xl relative'}
              aspect-video transition-all duration-300 ease-in-out
            `}
          >
            <VideoPlayer />
            <Overlay />
            
            {/* Drag Handle Indicator */}
            {isFloating && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-white/50 rounded-full cursor-move backdrop-blur-sm" />
            )}
          </motion.div>
        </main>
      </div>

      <Sidebar />
      <ChatModal />
      {showDashboard && <Dashboard />}
    </div>
  );
}
