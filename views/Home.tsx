
import React, { useState } from 'react';
import { Play, BookOpen, Settings, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User, ViewState } from '../types';
import { loginToSpotify, loginAsDemoUser } from '../services/spotifyService';

interface HomeProps {
  user: User | null;
  setUser: (user: User) => void;
  navigate: (view: ViewState) => void;
  createGame: () => void;
  joinGame: (code: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, setUser, navigate, createGame, joinGame }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await loginToSpotify();
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoUser = await loginAsDemoUser();
    setUser(demoUser);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-500/20">
          <Play size={40} className="text-black ml-1" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">SpotifySpel</h1>
        <p className="text-spotify-grey max-w-md">
          De ultieme muziekquiz. Kies nummers, verberg een thema, en laat je vrienden raden.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
            <Button onClick={handleLogin} disabled={loading} fullWidth>
             {loading ? 'Laden...' : 'Inloggen met Spotify (Premium)'}
            </Button>
            
            <Button onClick={handleDemoLogin} variant="outline" fullWidth className="border-gray-600 text-gray-300 hover:text-white hover:border-white">
              <Zap size={16} /> Start Demo Modus (Geen Login)
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto space-y-6 pt-12">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Hallo, {user.name}</h2>
          <p className="text-spotify-grey text-sm">
             {user.accessToken === 'mock_token' ? 'Demo Modus Actief' : 'Klaar om te spelen?'}
          </p>
        </div>
        <img 
          src={user.avatarUrl} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border-2 border-spotify-green"
        />
      </header>

      <div className="space-y-4">
        <Button fullWidth onClick={createGame} className="h-16 text-lg">
          <Play size={24} /> Nieuw Spel
        </Button>

        <div className="bg-spotify-light p-4 rounded-xl space-y-3">
          <Input 
            placeholder="Voer 6-cijferige code in"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center tracking-widest uppercase font-mono font-bold"
          />
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => joinCode.length >= 4 && joinGame(joinCode)}
            disabled={joinCode.length < 4}
          >
            Deelnemen
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => navigate(ViewState.RULES)}>
            <BookOpen size={20} /> Spelregels
          </Button>
          <Button variant="outline" onClick={() => navigate(ViewState.SETTINGS)}>
            <Settings size={20} /> Instellingen
          </Button>
        </div>
      </div>
    </div>
  );
};
