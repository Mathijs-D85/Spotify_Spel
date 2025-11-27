

export enum ViewState {
  HOME = 'HOME',
  LOBBY = 'LOBBY',
  SELECTION = 'SELECTION',
  GAMEPLAY = 'gameplay',
  SCORING = 'scoring',
  RESULTS = 'results',
  GAME_OVER = 'game_over',
  RULES = 'rules',
  SETTINGS = 'SETTINGS'
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  score: number;
  accessToken?: string; // Toegevoegd voor echte API calls
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  previewUrl: string | null;
  uri?: string; // Spotify URI nodig voor playback
}

export type GameMode = 'classic' | 'fast' | 'hardcore';

export interface GameSettings {
  rounds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  playTime: 15 | 30 | 45;
  thinkTime: 90 | 120 | 180;
  gameMode: GameMode;
  lockAnswers: boolean;
}

export interface Guess {
  title: string;
  artist: string;
}

export interface Round {
  selectorId: string;
  theme: string;
  songs: Song[];
  guesses: Record<string, { // userId -> guess
    points: number;
    themeGuess?: string;
    songGuesses?: Record<string, Guess>; // songId -> { title, artist }
  }>;
}

export type GameStatus = 'waiting' | 'selecting' | 'playing' | 'scoring' | 'results' | 'game_over' | 'finished';

export interface GameState {
  code: string;
  players: User[];
  currentRound: number;
  totalRounds: number;
  status: GameStatus;
  settings: GameSettings;
  activeRoundData?: Round | null; // Opslaan in DB
}
