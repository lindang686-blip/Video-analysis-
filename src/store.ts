import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type PointType = 'grammar' | 'collocation' | 'phrase' | 'native_expression' | 'useful_word' | 'culture' | 'grammar_correction' | 'authentic_replacement';

export interface LearningPoint {
  id: string;
  type: PointType;
  timestamp: number;
  content: string;
  explanation: string;
  example: string;
  subtitle: string;
  originalText?: string;
  correctedText?: string;
  ukUsDifference?: string;
  isLearned?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AppState {
  videoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  learningPoints: LearningPoint[];
  savedPoints: LearningPoint[];
  showDashboard: boolean;
  showChat: boolean;
  isFloating: boolean;
  chatContext: LearningPoint | null;
  chatMessages: ChatMessage[];
  
  setVideoUrl: (url: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addLearningPoint: (point: Omit<LearningPoint, 'id'>) => void;
  savePoint: (point: LearningPoint) => void;
  markAsLearned: (id: string) => void;
  setShowDashboard: (show: boolean) => void;
  setIsFloating: (isFloating: boolean) => void;
  openChat: (point: LearningPoint) => void;
  closeChat: () => void;
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;
  clearChat: () => void;
}

export const useStore = create<AppState>((set) => ({
  videoUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  learningPoints: [],
  savedPoints: [],
  showDashboard: false,
  showChat: false,
  isFloating: false,
  chatContext: null,
  chatMessages: [],

  setVideoUrl: (url) => set({ videoUrl: url, isPlaying: false, currentTime: 0, learningPoints: [] }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  addLearningPoint: (point) => set((state) => ({ 
    learningPoints: [...state.learningPoints, { ...point, id: uuidv4() }] 
  })),
  savePoint: (point) => set((state) => {
    if (state.savedPoints.find(p => p.id === point.id)) return state;
    return { savedPoints: [...state.savedPoints, point] };
  }),
  markAsLearned: (id) => set((state) => ({
    savedPoints: state.savedPoints.map(p => p.id === id ? { ...p, isLearned: true } : p)
  })),
  setShowDashboard: (show) => set({ showDashboard: show, isPlaying: !show }),
  setIsFloating: (isFloating) => set({ isFloating }),
  openChat: (point) => set({ showChat: true, chatContext: point, isPlaying: false }),
  closeChat: () => set({ showChat: false, chatContext: null, chatMessages: [] }),
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, { ...message, id: uuidv4() }]
  })),
  clearChat: () => set({ chatMessages: [] }),
}));
