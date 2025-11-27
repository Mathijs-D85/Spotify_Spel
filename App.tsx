import React, { useState, useEffect } from 'react';
import { ViewState, User, GameState, Song, Round, GameSettings } from './types';
import { getTokenFromCode, getCurrentUserProfile, getStoredToken } from './services/spotifyService';
import { createGameInFirebase, joinGameInFirebase, subscribeToGame, updateGameStatus, submitRoundToFirebase, submitGuessesToFirebase, submitRoundResults, transferHostRoleAndReset } from './services/firebaseService';
import { Home } from './views/Home';
import { Lobby } from './views/Lobby';
import { MusicSelector } from './views/MusicSelector';
import { Gameplay } from './views/Gameplay';
import { Rules } from './views/Rules';
import { Settings } from './views/Settings';
import { Results } from './views/Results';
import { Scoring } from './views/Scoring';
import { GameOver } from './views/GameOver';
import { WebPlayer } from './components/WebPlayer';
import { ErrorBanner } from './components/ErrorBanner';

const INITIAL_GAME_STATE: GameState = {
  code: '',
  players: [],
  currentRound: 1,
  totalRounds: 3,
  status: 'waiting',
  settings: {
    rounds: 3,
    difficulty: 'easy',
    playTime: 30,
    thinkTime: 90,
    gameMode: 'classic',
    lockAnswers: true
  }
};

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handling Auth Callback and Session
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check URL for callback code
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const token = await getTokenFromCode(code);
          window.history.replaceState({}, document.title, '/'); // Clean URL
          const user = await getCurrentUserProfile(token);
          setCurrentUser(user);
        } catch (error) {
          console.error("Auth Error (Check Client ID or Redirect URI):", error);
        }
      } else {
        // 2. Check Local Storage
        const storedToken = getStoredToken();
        if (storedToken) {
          try {
            const user = await getCurrentUserProfile(storedToken);
            setCurrentUser(user);
          } catch (e) {
            console.error("Session expired:", e);
            window.localStorage.removeItem('spotify_access_token');
          }
        }
      }
    };
    checkAuth();
  }, []);

  // Sync Game State with View
  useEffect(() => {
    if (!gameState.code) return;

    // View Routing logic based on Game Status
    if (gameState.status === 'waiting' && view !== ViewState.LOBBY) {
      setView(ViewState.LOBBY);
    } else if (gameState.status === 'selecting') {
      // Only the host/selector goes to selection, others wait (in a real game we need logic for whose turn it is)
      // For MVP: Host is always selector of Round 1
      if (currentUser?.isHost) {
        setView(ViewState.SELECTION);
      } else {
        // View logic for non-selectors
        // For now, keep them in lobby or show a 'waiting for selector' screen
        // To keep MVP simple, we show Lobby with status text
      }
    } else if (gameState.status === 'playing') {
      setView(ViewState.GAMEPLAY);
    } else if (gameState.status === 'scoring') {
      setView(ViewState.SCORING);
    } else if (gameState.status === 'results') {
      setView(ViewState.RESULTS);
    } else if (gameState.status === 'game_over') {
      setView(ViewState.GAME_OVER);
    }
  }, [gameState.status, gameState.code, currentUser, view]);

  // Sync local currentUser with gameState players (Critical for Host Rotation!)
  useEffect(() => {
    if (!currentUser || !gameState.players.length) return;

    const meInGame = gameState.players.find(p => p.id === currentUser.id);
    if (meInGame) {
      // Check if relevant properties changed (isHost, score)
      if (meInGame.isHost !== currentUser.isHost || meInGame.score !== currentUser.score) {
        console.log("Syncing current user from game state:", meInGame);
        setCurrentUser(prev => ({ ...prev!, isHost: meInGame.isHost, score: meInGame.score }));
      }
    }
  }, [gameState.players]);

  // Actions
  const createGame = async () => {
    if (!currentUser) return;
    try {
      const hostUser = { ...currentUser, isHost: true };
      setCurrentUser(hostUser);

      // Load preferences from local storage
      const storedPrefs = localStorage.getItem('host_prefs');
      const initialSettings: GameSettings | undefined = storedPrefs ? JSON.parse(storedPrefs) : undefined;

      const code = await createGameInFirebase(hostUser, initialSettings);

      // Subscribe to updates
      subscribeToGame(code, (updatedState) => {
        setGameState(updatedState);
      });
    } catch (e: any) {
      console.error("Create Game Error:", e);
      setError("Kon spel niet aanmaken: " + (e.message || "Onbekende fout"));
    }
  };

  const joinGame = async (code: string) => {
    if (!currentUser) return;
    try {
      const success = await joinGameInFirebase(code, currentUser);
      if (success) {
        subscribeToGame(code, (updatedState) => {
          setGameState(updatedState);
        });
      } else {
        setError("Spel niet gevonden! Controleer de code.");
      }
    } catch (e: any) {
      console.error("Join Game Error:", e);
      setError("Kon niet deelnemen: " + (e.message || "Onbekende fout"));
    }
  };

  const startGame = async () => {
    await updateGameStatus(gameState.code, 'selecting');
  };

  const handleSelectionConfirmed = async (theme: string, songs: Song[]) => {
    if (!currentUser) return;
    try {
      const newRound: Round = {
        selectorId: currentUser.id,
        theme,
        songs,
        guesses: {}
      };
      await submitRoundToFirebase(gameState.code, newRound);
    } catch (e: any) {
      console.error("Submit Round Error:", e);
      setError("Kon selectie niet bevestigen: " + (e.message || "Probeer opnieuw"));
    }
  };

  const handleSubmitGuesses = async (guesses: any) => {
    if (!currentUser) return;
    try {
      await submitGuessesToFirebase(gameState.code, currentUser.id, guesses);
    } catch (e: any) {
      console.error("Submit Guesses Error:", e);
      setError("Kon antwoorden niet versturen: " + (e.message || "Probeer opnieuw"));
    }
  };

  const finishRound = async () => {
    // Only the host can finish the round
    if (!currentUser?.isHost || !gameState.activeRoundData) return;

    console.log("Host finishing round...");

    // Go to Scoring view (Quizmaster Mode)
    updateGameStatus(gameState.code, 'scoring');
  };

  const handleScoresConfirmed = async (updatedPlayers: User[]) => {
    if (!currentUser?.isHost) return;

    try {
      await submitRoundResults(gameState.code, updatedPlayers, 'results');
    } catch (e: any) {
      console.error("Error submitting results:", e);
      setError("Kon resultaten niet opslaan.");
    }
  };

  const handleNextRound = async () => {
    if (!currentUser?.isHost) return;

    // Check if game is over
    if (gameState.currentRound >= gameState.totalRounds) {
      await updateGameStatus(gameState.code, 'game_over');
      return;
    }

    // 1. Determine Next Host (Rotate)
    // Find current host index based on the players list in state
    const currentHostIndex = gameState.players.findIndex(p => p.isHost);
    // If for some reason no host found, default to 0
    const safeIndex = currentHostIndex === -1 ? 0 : currentHostIndex;
    const nextHostIndex = (safeIndex + 1) % gameState.players.length;
    const nextHost = gameState.players[nextHostIndex];

    console.log(`Rotating host from ${gameState.players[safeIndex].name} to ${nextHost.name}`);

    // 2. Transfer Host Role in Firebase (Atomic update)
    try {
      await transferHostRoleAndReset(gameState.code, nextHost.id, gameState.players, gameState.currentRound + 1);
      // Status update is now handled inside transferHostRoleAndReset
    } catch (e) {
      console.error("Error rotating host:", e);
      setError("Kon beurt niet doorgeven.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_code_verifier');
    setCurrentUser(null);
    setView(ViewState.HOME);
    setView(ViewState.HOME);
  };

  const handlePlayerReady = (id: string) => {
    console.log("Player Ready with ID:", id);
    setDeviceId(id);
  };

  const handlePlayerError = (msg: string) => {
    console.error("Player Error:", msg);
    setError(msg);
  };

  // Router
  switch (view) {
    case ViewState.HOME:
      return (
        <>
          <ErrorBanner message={error} onClose={() => setError(null)} />
          {currentUser?.accessToken && (
            <WebPlayer
              token={currentUser.accessToken}
              onReady={handlePlayerReady}
              onNotReady={() => setDeviceId(null)}
              onError={handlePlayerError}
            />
          )}
          <Home
            user={currentUser}
            setUser={setCurrentUser}
            navigate={setView}
            createGame={createGame}
            joinGame={joinGame}
          />
        </>
      );
    case ViewState.LOBBY:
      return (
        <Lobby
          gameState={gameState}
          currentUser={currentUser!}
          onStartGame={startGame}
          onLeaveGame={() => setView(ViewState.HOME)}
        />
      );
    case ViewState.SELECTION:
      return <MusicSelector onConfirmSelection={handleSelectionConfirmed} accessToken={currentUser?.accessToken || ''} />;
    case ViewState.GAMEPLAY:
      return (
        <>
          {currentUser?.accessToken && (
            <WebPlayer
              token={currentUser.accessToken}
              onReady={handlePlayerReady}
              onNotReady={() => setDeviceId(null)}
              onError={handlePlayerError}
            />
          )}
          <Gameplay
            round={gameState.activeRoundData!}
            roundNumber={gameState.currentRound}
            totalRounds={gameState.totalRounds}
            currentSelector={gameState.players.find(p => p.id === gameState.activeRoundData?.selectorId) || currentUser!}
            currentUser={currentUser!}
            onFinishRound={currentUser?.isHost ? finishRound : handleSubmitGuesses}
            deviceId={deviceId}
            submittedPlayers={Object.keys(gameState.activeRoundData?.guesses || {})}
            lockAnswers={gameState.settings.lockAnswers}
          />
        </>
      );
    case ViewState.SCORING:
      return (
        <Scoring
          gameState={gameState}
          currentUser={currentUser!}
          onConfirmScores={handleScoresConfirmed}
        />
      );
    case ViewState.RESULTS:
      return (
        <Results
          gameState={gameState}
          currentUser={currentUser!}
          onNextRound={handleNextRound}
        />
      );
    case ViewState.RULES:
      return <Rules onBack={() => setView(ViewState.HOME)} />;

    case ViewState.SETTINGS:
      return <Settings user={currentUser} onLogout={handleLogout} onBack={() => setView(ViewState.HOME)} />;

    case ViewState.GAME_OVER:
      return (
        <GameOver
          gameState={gameState}
          currentUser={currentUser!}
          onBackToHome={() => {
            setGameState(INITIAL_GAME_STATE); // Reset game state to stop the effect from redirecting back
            setView(ViewState.HOME);
            // Do NOT reset currentUser, so they stay logged in
          }}
        />
      );

    default:
      return <div className="text-white p-10">Loading...</div>;
  }
}
