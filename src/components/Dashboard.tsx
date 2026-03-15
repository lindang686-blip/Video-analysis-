import React, { useState, useEffect } from 'react';
import { useStore, LearningPoint } from '../store';
import { motion } from 'motion/react';
import { Play, Pause, RefreshCw, BookOpen, Mic, CheckCircle, XCircle, MessageCircle, ArrowRight, Globe } from 'lucide-react';
import { generateHermionePodcast, generateAudio } from '../services/ai';

export const Dashboard: React.FC = () => {
  const { savedPoints, setShowDashboard, openChat } = useStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'review' | 'podcast'>('summary');
  
  // Review State
  const [reviewList, setReviewList] = useState<LearningPoint[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewTypes, setReviewTypes] = useState<string[]>(['grammar', 'collocation', 'phrase', 'native_expression', 'useful_word', 'culture', 'grammar_correction', 'authentic_replacement']);

  // Podcast State
  const [podcastScript, setPodcastScript] = useState('');
  const [podcastAudio, setPodcastAudio] = useState<string | null>(null);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (activeTab === 'review') {
      startReview();
    }
  }, [activeTab, reviewTypes]);

  const startReview = () => {
    const filtered = savedPoints.filter(p => reviewTypes.includes(p.type));
    // Shuffle array for random order
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setReviewList(shuffled);
    setCurrentReviewIndex(0);
    setShowAnswer(false);
  };

  const handleReviewAnswer = (knewIt: boolean) => {
    if (currentReviewIndex < reviewList.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Finished review
      setReviewList([]);
    }
  };

  const handleGeneratePodcast = async () => {
    setIsGeneratingPodcast(true);
    const script = await generateHermionePodcast(savedPoints);
    setPodcastScript(script);
    const audio = await generateAudio(script);
    setPodcastAudio(audio);
    setIsGeneratingPodcast(false);
  };

  const togglePodcastPlayback = () => {
    if (audioRef.current) {
      if (isPlayingPodcast) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingPodcast(!isPlayingPodcast);
    }
  };

  const groupedPoints = savedPoints.reduce((acc, point) => {
    if (!acc[point.type]) acc[point.type] = [];
    acc[point.type].push(point);
    return acc;
  }, {} as Record<string, LearningPoint[]>);

  return (
    <div className="absolute inset-0 bg-slate-950 z-40 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Post-Video Dashboard</h1>
          <button
            onClick={() => setShowDashboard(false)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
          >
            Back to Video
          </button>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Summary & Categorization
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'review' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Ebbinghaus Review
          </button>
          <button
            onClick={() => setActiveTab('podcast')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'podcast' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Hermione's Podcast
          </button>
        </div>

        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groupedPoints).map(([type, points]) => (
              <div key={type} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-indigo-400 mb-4 capitalize flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {type.replace('_', ' ')}
                </h2>
                <div className="space-y-4">
                  {points.map(point => (
                    <div key={point.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-200 text-lg">{point.content}</h3>
                        {point.isLearned && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full shrink-0">Learned</span>}
                      </div>

                      {point.originalText && point.correctedText && (
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex flex-col gap-1.5">
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-rose-400 line-through opacity-80 shrink-0 mt-0.5">Original:</span>
                            <span className="text-rose-300">{point.originalText}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-emerald-400 font-medium shrink-0 mt-0.5 flex items-center gap-1">
                              <ArrowRight size={14} /> Better:
                            </span>
                            <span className="text-emerald-300 font-medium">{point.correctedText}</span>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-slate-400">{point.explanation}</p>

                      {point.ukUsDifference && (
                        <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20">
                          <h5 className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                            <Globe size={12} /> UK vs US
                          </h5>
                          <p className="text-sm text-indigo-200">{point.ukUsDifference}</p>
                        </div>
                      )}

                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-sm italic text-emerald-400">"{point.example}"</p>
                      </div>

                      <div className="pt-2 mt-1 border-t border-slate-700/50 flex justify-end">
                        <button
                          onClick={() => {
                            setShowDashboard(false);
                            openChat(point);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors text-sm font-medium"
                        >
                          <MessageCircle size={16} />
                          Ask AI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {savedPoints.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">
                No points saved yet. Go watch a video!
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              {['grammar', 'collocation', 'phrase', 'native_expression', 'useful_word', 'culture', 'grammar_correction', 'authentic_replacement'].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    if (reviewTypes.includes(type)) {
                      setReviewTypes(reviewTypes.filter(t => t !== type));
                    } else {
                      setReviewTypes([...reviewTypes, type]);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${reviewTypes.includes(type) ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {reviewList.length > 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
                <div className="text-sm text-slate-500 mb-8 font-medium tracking-widest uppercase">
                  Card {currentReviewIndex + 1} of {reviewList.length}
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-6">{reviewList[currentReviewIndex].content}</h2>
                
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="mt-8 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
                  >
                    Show Answer
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-6 text-left"
                  >
                    <div className="bg-slate-800 p-6 rounded-2xl">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Explanation</h3>
                      <p className="text-slate-200 text-lg leading-relaxed">{reviewList[currentReviewIndex].explanation}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Example</h3>
                      <p className="text-emerald-400 italic text-lg leading-relaxed">"{reviewList[currentReviewIndex].example}"</p>
                    </div>
                    
                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => handleReviewAnswer(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl font-bold transition-colors"
                      >
                        <XCircle size={24} />
                        Forgot
                      </button>
                      <button
                        onClick={() => handleReviewAnswer(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-2xl font-bold transition-colors"
                      >
                        <CheckCircle size={24} />
                        Remembered
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Review Complete!</h2>
                <p className="text-slate-400">You've reviewed all selected points for today.</p>
                <button
                  onClick={startReview}
                  className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={18} />
                  Restart Review
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'podcast' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                  <Mic size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Hermione's Review Podcast</h2>
                  <p className="text-slate-400">A custom British English podcast reviewing your saved points.</p>
                </div>
              </div>

              {!podcastScript ? (
                <div className="text-center py-12">
                  <button
                    onClick={handleGeneratePodcast}
                    disabled={isGeneratingPodcast || savedPoints.length === 0}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
                  >
                    {isGeneratingPodcast ? (
                      <>
                        <RefreshCw className="animate-spin" size={24} />
                        Generating Podcast...
                      </>
                    ) : (
                      <>
                        <Play size={24} />
                        Generate Podcast
                      </>
                    )}
                  </button>
                  {savedPoints.length === 0 && (
                    <p className="text-rose-400 mt-4 text-sm">Save some points first to generate a podcast!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {podcastAudio && (
                    <div className="bg-slate-800 p-6 rounded-2xl flex items-center gap-6">
                      <button
                        onClick={togglePodcastPlayback}
                        className="w-16 h-16 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-purple-500/20"
                      >
                        {isPlayingPodcast ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </button>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-1/3 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                          <span>Playing...</span>
                          <span>British English (Hermione)</span>
                        </div>
                      </div>
                      <audio
                        ref={audioRef}
                        src={podcastAudio}
                        onEnded={() => setIsPlayingPodcast(false)}
                        className="hidden"
                      />
                    </div>
                  )}
                  
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Podcast Script (Editable)</h3>
                    </div>
                    <textarea
                      value={podcastScript}
                      onChange={(e) => setPodcastScript(e.target.value)}
                      className="w-full h-64 bg-transparent text-slate-200 resize-none focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
