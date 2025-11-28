
import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Song, Round, User } from '../types';
import { playTrack, pausePlayer } from '../services/spotifyService';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface GameplayProps {
  round: Round;
  roundNumber: number;
  totalRounds: number;
  currentSelector: User;
  currentUser: User;
  onFinishRound: (guesses?: any) => void;
  deviceId: string | null;
  submittedPlayers?: string[];
  lockAnswers?: boolean;
}

export const Gameplay: React.FC<GameplayProps> = ({ round, roundNumber, totalRounds, currentSelector, currentUser, onFinishRound, deviceId, submittedPlayers = [], lockAnswers = true }) => {
  const [timeLeft, setTimeLeft] = useState(90);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [revealedSongs, setRevealedSongs] = useState<string[]>([]);
  const [themeGuess, setThemeGuess] = useState('');
  const [songGuesses, setSongGuesses] = useState<Record<string, { title: string, artist: string }>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const togglePlay = async (song: Song) => {
    // Allow playing even if no deviceId (Remote Control Mode)
    // But we need a token
    if (!currentUser.accessToken) return;

    const targetDeviceId = currentUser.accessToken === 'mock_token' ? 'mock' : deviceId;

    if (playingSongId === song.id) {
      await pausePlayer(targetDeviceId, currentUser.accessToken);
      setPlayingSongId(null);
    } else {
      try {
        await playTrack(targetDeviceId, song.uri || '', currentUser.accessToken);
        setPlayingSongId(song.id);
      } catch (e) {
        console.error("Playback failed", e);
        alert("Kon niet afspelen. Zorg dat Spotify open staat op je apparaat.");
      }
    }
  };

  const progress = (timeLeft / 90) * 100;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-spotify-dark sticky top-0 z-20 shadow-xl">
        <div>
          <span className="text-xs font-bold text-spotify-green uppercase tracking-wider">Ronde {roundNumber}/{totalRounds}</span>
          <p className="text-sm font-medium">Selector: {currentSelector.name}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Clock size={16} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'} />
          <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1 bg-gray-800 w-full">
        <div className="h-full bg-spotify-green transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
      </div>

      {!deviceId && currentUser.accessToken !== 'mock_token' && (
        <div className="bg-yellow-600/20 text-yellow-500 text-xs p-2 text-center">
          Geen web player. Open Spotify App om te luisteren.
        </div>
      )}
      {currentUser.accessToken === 'mock_token' && (
        <div className="bg-blue-600/20 text-blue-400 text-xs p-2 text-center">
          Demo Modus: Muziek wordt gesimuleerd
        </div>
      )}

      {/* Songs List */}
      <div className="p-4 space-y-4">
        {round.songs.map((song, idx) => {
          const isRevealed = revealedSongs.includes(song.id);
          const isPlaying = playingSongId === song.id;

          return (
            <div key={song.id} className={`relative bg-spotify-light rounded-xl overflow-hidden transition-all ${isPlaying ? 'ring-2 ring-spotify-green' : ''}`}>
              <div className="flex items-center p-3 gap-4">
                <button
                  onClick={() => togglePlay(song)}
                  disabled={false}
                  className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isPlaying ? <Pause fill="black" size={20} className="text-black" /> : <Play fill="black" size={20} className="text-black ml-1" />}
                </button>

                <div className="flex-1 min-w-0">
                  {isRevealed || currentUser.id === currentSelector.id ? (
                    <div className="animate-fadeIn">
                      <p className="font-bold truncate text-white">{song.title}</p>
                      <p className="text-sm text-spotify-grey truncate">{song.artist}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input for guessing (Simulated) */}
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
                <input
                  disabled={isRevealed || hasSubmitted || currentUser.id === currentSelector.id || (lockAnswers && timeLeft === 0)}
                  placeholder={isRevealed ? "Titel onthuld" : "Raad titel..."}
                  value={songGuesses[song.id]?.title || ''}
                  onChange={(e) => setSongGuesses(prev => ({
                    ...prev,
                    [song.id]: { ...prev[song.id], title: e.target.value }
                  }))}
                  className="w-full bg-black/20 text-sm p-2 rounded text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-spotify-green disabled:opacity-50"
                />
                <input
                  disabled={isRevealed || hasSubmitted || currentUser.id === currentSelector.id || (lockAnswers && timeLeft === 0)}
                  placeholder={isRevealed ? "Artiest onthuld" : "Raad artiest..."}
                  value={songGuesses[song.id]?.artist || ''}
                  onChange={(e) => setSongGuesses(prev => ({
                    ...prev,
                    [song.id]: { ...prev[song.id], artist: e.target.value }
                  }))}
                  className="w-full bg-black/20 text-sm p-2 rounded text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-spotify-green disabled:opacity-50"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Theme Guess */}
      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2 text-blue-300">
            <AlertCircle size={16} />
            <span className="text-xs font-bold uppercase">Bonus Punten (3pt)</span>
          </div>
          <Input
            placeholder="Wat is het thema?"
            value={themeGuess}
            onChange={e => setThemeGuess(e.target.value)}
            disabled={hasSubmitted || currentUser.id === currentSelector.id || (lockAnswers && timeLeft === 0)}
            className="bg-black/40 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="p-4 sticky bottom-0 bg-spotify-dark space-y-4">
        {currentUser.id === currentSelector.id && (
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Spelers klaar ({submittedPlayers.length})</p>
            <div className="flex flex-wrap gap-2">
              {submittedPlayers.map(pid => (
                <span key={pid} className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                  {pid}
                </span>
              ))}
              {submittedPlayers.length === 0 && <span className="text-xs text-gray-500 italic">Nog niemand...</span>}
            </div>
          </div>
        )}

        {currentUser.id === currentSelector.id ? (
          <Button fullWidth onClick={() => onFinishRound()}>
            Ronde Beëindigen
          </Button>
        ) : (
          <Button
            fullWidth
            onClick={() => {
              setHasSubmitted(true);
              onFinishRound({ songGuesses, themeGuess });
            }}
            disabled={hasSubmitted}
          >
            {hasSubmitted ? 'Wachten op host...' : 'Antwoorden Versturen'}
          </Button>
        )}
      </div>
    </div>
  );
};
