
import React from 'react';
import { Users, Clock, Music, Trophy, Copy, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { GameState, User, GameSettings } from '../types';
import { updateGameSettings } from '../services/firebaseService';

interface LobbyProps {
  gameState: GameState;
  currentUser: User;
  onStartGame: () => void;
  onLeaveGame: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ gameState, currentUser, onStartGame, onLeaveGame }) => {
  const isHost = currentUser.isHost;
  const settings = gameState.settings;

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.code);
    alert('Code gekopieerd!');
  };

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    if (!isHost) return;
    const newSettings = { ...settings, [key]: value };
    updateGameSettings(gameState.code, newSettings);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto pt-8">
      <div className="text-center mb-8">
        <h2 className="text-spotify-grey uppercase text-xs tracking-widest mb-2">Spellobby</h2>
        <div
          onClick={copyCode}
          className="text-5xl font-black tracking-widest text-spotify-green cursor-pointer hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3"
        >
          {gameState.code} <Copy size={20} className="text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm mt-2">Deel deze code met je vrienden</p>
      </div>

      <div className="bg-spotify-light rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Users size={18} /> Spelers ({gameState.players.length})
          </h3>
          {gameState.players.length < 2 && (
            <span className="text-xs text-yellow-500 animate-pulse">Wachten op spelers...</span>
          )}
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {gameState.players.map((player) => (
            <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full" />
              <span className="flex-1 font-medium truncate">{player.name} {player.isHost && '👑'}</span>
              {player.id === currentUser.id && <span className="text-xs text-spotify-green flex-shrink-0">(Jij)</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-spotify-light rounded-xl p-4 mb-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
          <h3 className="font-bold">Spelinstellingen</h3>
          {!isHost && <span className="text-xs text-gray-500 italic">Alleen host kan wijzigen</span>}
        </div>

        {/* Game Mode Selector */}
        <div className="bg-black/20 p-2 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 flex items-center gap-2"><Zap size={16} /> Spelmodus</span>
            {isHost ? (
              <select
                value={settings.gameMode || 'classic'}
                onChange={(e) => handleSettingChange('gameMode', e.target.value)}
                className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm focus:border-spotify-green outline-none"
                disabled={gameState.currentRound > 1}
              >
                <option value="classic">Klassiek</option>
                <option value="fast">Snelle Ronde</option>
                <option value="hardcore">Hardcore</option>
              </select>
            ) : (
              <span className="text-sm font-bold uppercase text-spotify-green">{settings.gameMode || 'classic'}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 italic">
            {settings.gameMode === 'fast' && 'Kortere afspeeltijd, snellere rondes.'}
            {settings.gameMode === 'hardcore' && 'Geen artiestennamen, thema is 5 punten waard.'}
            {(settings.gameMode === 'classic' || !settings.gameMode) && 'Standaard regels.'}
          </p>
        </div>

        {/* Regular Settings */}
        <div className={`space-y-3 ${gameState.currentRound > 1 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center gap-2"><Trophy size={16} /> Moeilijkheid</span>
            {isHost ? (
              <select
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                className="bg-black/30 border border-gray-700 rounded px-2 py-1 text-sm focus:border-spotify-green outline-none"
                disabled={gameState.currentRound > 1}
              >
                <option value="easy">Eenvoudig</option>
                <option value="medium">Gemiddeld</option>
                <option value="hard">Moeilijk</option>
              </select>
            ) : (
              <span className="text-sm font-medium text-gray-300 capitalize">{settings.difficulty}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center gap-2"><Clock size={16} /> Bedenktijd</span>
            {isHost ? (
              <select
                value={settings.thinkTime}
                onChange={(e) => handleSettingChange('thinkTime', parseInt(e.target.value))}
                className="bg-black/30 border border-gray-700 rounded px-2 py-1 text-sm focus:border-spotify-green outline-none"
                disabled={gameState.currentRound > 1}
              >
                <option value="90">90 sec</option>
                <option value="120">120 sec</option>
                <option value="180">180 sec</option>
              </select>
            ) : (
              <span className="text-sm font-medium text-gray-300">{settings.thinkTime} sec</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 flex items-center gap-2"><Music size={16} /> Rondes</span>
            {isHost ? (
              <select
                value={settings.rounds}
                onChange={(e) => handleSettingChange('rounds', parseInt(e.target.value))}
                className="bg-black/30 border border-gray-700 rounded px-2 py-1 text-sm focus:border-spotify-green outline-none"
                disabled={gameState.currentRound > 1}
              >
                <option value="1">1 Ronde (Demo)</option>
                <option value="3">3 Rondes</option>
                <option value="5">5 Rondes</option>
                <option value="10">10 Rondes</option>
              </select>
            ) : (
              <span className="text-sm font-medium text-gray-300">{settings.rounds} Rondes</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-300 flex items-center gap-2">🔒 Antwoorden Slot</span>
            {isHost ? (
              <button
                onClick={() => handleSettingChange('lockAnswers', !settings.lockAnswers)}
                className={`w-10 h-5 rounded-full transition-colors relative ${settings.lockAnswers ? 'bg-spotify-green' : 'bg-gray-600'}`}
                disabled={gameState.currentRound > 1}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.lockAnswers ? 'translate-x-5' : ''}`} />
              </button>
            ) : (
              <span className="text-sm font-medium text-gray-300">{settings.lockAnswers ? 'Aan' : 'Uit'}</span>
            )}
          </div>
        </div>
        {gameState.currentRound > 1 && isHost && (
          <div className="text-xs text-center text-gray-500 italic">
            Instellingen zijn vergrendeld tijdens het spel.
          </div>
        )}
      </div>

      <div className="mt-auto space-y-3 pb-6">
        {isHost ? (
          <Button
            fullWidth
            onClick={onStartGame}
            disabled={gameState.players.length < 1}
          >
            Spel Starten <ArrowRight size={20} />
          </Button>
        ) : (
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <span className="text-sm animate-pulse text-spotify-green font-medium">Wachten op host...</span>
          </div>
        )}
        <Button variant="ghost" fullWidth onClick={onLeaveGame} className="text-red-400 hover:text-red-300">
          Verlaten
        </Button>
      </div>
    </div>
  );
};
