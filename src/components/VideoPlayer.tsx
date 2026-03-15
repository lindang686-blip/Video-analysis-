import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useStore } from '../store';
import { generateLearningPoint } from '../services/ai';

export const VideoPlayer: React.FC = () => {
  const { videoUrl, isPlaying, setIsPlaying, setCurrentTime, setDuration, addLearningPoint, showDashboard, showChat } = useStore();
  const playerRef = useRef<ReactPlayer>(null);
  const [lastGeneratedTime, setLastGeneratedTime] = useState(-10);

  const handleProgress = async (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
    
    // Simulate AI generating a learning point every 30 seconds for demo purposes
    if (state.playedSeconds - lastGeneratedTime > 30 && isPlaying && !showDashboard && !showChat) {
      setLastGeneratedTime(state.playedSeconds);
      setIsPlaying(false); // Pause video
      
      try {
        const point = await generateLearningPoint(state.playedSeconds);
        if (point) {
          addLearningPoint(point);
        } else {
          setIsPlaying(true); // Resume if failed
        }
      } catch (error) {
        console.error("Failed to generate point:", error);
        setIsPlaying(true);
      }
    }
  };

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 rounded-xl border border-slate-800">
        <p>Please enter a video URL or upload a file to start learning.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={isPlaying}
        controls={true}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={setDuration}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous",
            },
          },
        }}
      />
    </div>
  );
};
