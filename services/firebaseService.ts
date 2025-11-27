
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update, get, child, Database } from "firebase/database";
import { FIREBASE_CONFIG } from '../config';
import { GameState, User, Round, GameSettings } from '../types';

// Initialize Firebase safely
let app;
let db: Database;

try {
  app = initializeApp(FIREBASE_CONFIG);
  db = getDatabase(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export const generateGameCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createGameInFirebase = async (host: User, initialSettings?: GameSettings): Promise<string> => {
  if (!db) throw new Error("Database not initialized");
  const code = generateGameCode();

  const defaultSettings: GameSettings = {
    rounds: 3,
    difficulty: 'medium',
    playTime: 30,
    thinkTime: 90,
    gameMode: 'classic',
    lockAnswers: true
  };

  const initialGameState: GameState = {
    code,
    players: [host],
    currentRound: 1,
    totalRounds: initialSettings?.rounds || 3,
    status: 'waiting',
    settings: initialSettings || defaultSettings
  };

  await set(ref(db, `games/${code}`), initialGameState);
  return code;
};

export const joinGameInFirebase = async (code: string, user: User): Promise<boolean> => {
  if (!db) return false;
  const gameRef = ref(db, `games/${code}`);
  const snapshot = await get(gameRef);

  if (!snapshot.exists()) return false;

  const game = snapshot.val() as GameState;

  // Check if player already exists
  if (!game.players.some(p => p.id === user.id)) {
    const updatedPlayers = [...(game.players || []), user];
    await update(gameRef, { players: updatedPlayers });
  }

  return true;
};

export const subscribeToGame = (code: string, callback: (game: GameState) => void) => {
  if (!db) return () => { };
  const gameRef = ref(db, `games/${code}`);
  return onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

export const updateGameStatus = async (code: string, status: GameState['status']) => {
  if (!db) return;
  await update(ref(db, `games/${code}`), { status });
};

export const submitRoundToFirebase = async (code: string, round: Round) => {
  if (!db) return;
  await update(ref(db, `games/${code}`), {
    activeRoundData: round,
    status: 'playing'
  });
};

export const updateGameSettings = async (code: string, settings: GameSettings) => {
  if (!db) return;
  await update(ref(db, `games/${code}`), {
    settings: settings,
    totalRounds: settings.rounds // Sync total rounds immediate
  });
};

export const submitGuessesToFirebase = async (code: string, userId: string, guesses: any) => {
  if (!db) return;
  await update(ref(db, `games/${code}/activeRoundData/guesses/${userId}`), guesses);
};

export const submitRoundResults = async (code: string, players: any[], nextStatus: string) => {
  if (!db) return;
  const updates: any = {};
  updates[`games/${code}/status`] = nextStatus;
  updates[`games/${code}/players`] = players;
  await update(ref(db), updates);
};



export const transferHostRoleAndReset = async (code: string, newHostId: string, players: User[], nextRoundNumber: number) => {
  if (!db) return;
  const updatedPlayers = players.map(p => ({
    ...p,
    isHost: p.id === newHostId
  }));

  const updates: any = {};
  updates[`games/${code}/players`] = updatedPlayers;
  updates[`games/${code}/status`] = 'waiting';
  updates[`games/${code}/activeRoundData`] = null;
  updates[`games/${code}/currentRound`] = nextRoundNumber;

  await update(ref(db), updates);
};
