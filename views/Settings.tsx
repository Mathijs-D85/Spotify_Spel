
import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Moon, Volume2, Globe, Sliders, Save } from 'lucide-react';
import { Button } from '../components/Button';
import { User, GameSettings } from '../types';

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onBack: () => void;
}

const DEFAULT_PREFS: GameSettings = {
  rounds: 3,
  difficulty: 'medium',
  playTime: 30,
  thinkTime: 60,
  gameMode: 'classic'
};

export const Settings: React.FC<SettingsProps> = ({ user, onLogout, onBack }) => {
  const [prefs, setPrefs] = useState<GameSettings>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('host_prefs');
    if (stored) {
      setPrefs(JSON.parse(stored));
    }
  }, []);

  const savePrefs = (newPrefs: GameSettings) => {
    setPrefs(newPrefs);
    localStorage.setItem('host_prefs', JSON.stringify(newPrefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updatePref = (key: keyof GameSettings, value: any) => {
    savePrefs({ ...prefs, [key]: value });
  };

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-0 hover:bg-transparent text-white w-auto">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-bold">Instellingen</h2>
      </div>

      <div className="space-y-8">
        {/* Profiel Sectie */}
        {user && (
          <section className="bg-spotify-light p-4 rounded-xl flex items-center gap-4">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-16 h-16 rounded-full border-2 border-spotify-green"
            />
            <div>
              <p className="text-xs text-spotify-grey uppercase tracking-wider">Ingelogd als</p>
              <h3 className="text-xl font-bold">{user.name}</h3>
              {user.accessToken === 'mock_token' && (
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">Demo Account</span>
              )}
            </div>
          </section>
        )}

        {/* Host Voorkeuren */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-400 text-sm uppercase flex items-center gap-2">
              <Sliders size={14} /> Mijn Host Voorkeuren
            </h3>
            {saved && <span className="text-xs text-spotify-green flex items-center gap-1"><Save size={12}/> Opgeslagen</span>}
           </div>
           
           <div className="bg-white/5 rounded-xl p-4 space-y-5">
             {/* Rondes */}
             <div>
               <div className="flex justify-between text-sm mb-2">
                 <label>Standaard Rondes</label>
                 <span className="font-bold text-spotify-green">{prefs.rounds}</span>
               </div>
               <input 
                 type="range" 
                 min="1" 
                 max="10" 
                 value={prefs.rounds}
                 onChange={(e) => updatePref('rounds', parseInt(e.target.value))}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-spotify-green"
               />
               <div className="flex justify-between text-xs text-gray-500 mt-1">
                 <span>1</span><span>10</span>
               </div>
             </div>

             {/* Bedenktijd */}
             <div>
                <label className="block text-sm mb-2">Standaard Bedenktijd</label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 120].map((t) => (
                    <button
                      key={t}
                      onClick={() => updatePref('thinkTime', t)}
                      className={`py-2 rounded text-sm font-medium transition-colors ${
                        prefs.thinkTime === t 
                          ? 'bg-spotify-green text-black' 
                          : 'bg-black/40 text-gray-400 hover:bg-black/60'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
             </div>

              {/* Moeilijkheid */}
             <div>
                <label className="block text-sm mb-2">Standaard Moeilijkheid</label>
                <select 
                  value={prefs.difficulty}
                  onChange={(e) => updatePref('difficulty', e.target.value)}
                  className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm text-white focus:border-spotify-green focus:outline-none"
                >
                  <option value="easy">Eenvoudig (Thema = 1pt)</option>
                  <option value="medium">Gemiddeld (Thema = 3pt)</option>
                  <option value="hard">Moeilijk (Thema = 5pt)</option>
                </select>
             </div>
           </div>
           <p className="text-xs text-gray-500 italic">Deze instellingen worden standaard gebruikt als jij een nieuw spel start.</p>
        </section>

        {/* App Voorkeuren (Mocked voor MVP) */}
        <section className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="font-bold text-gray-400 text-sm uppercase">App Voorkeuren</h3>
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-gray-300" />
              <span>Dark Mode</span>
            </div>
            <div className="w-10 h-6 bg-spotify-green rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

           <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-gray-300" />
              <span>Taal</span>
            </div>
             <span className="text-xs text-gray-500">Nederlands</span>
          </div>
        </section>

        {/* Account Acties */}
        <section className="pt-8">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={onLogout}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-300"
          >
            <LogOut size={18} /> Uitloggen
          </Button>
          <p className="text-center text-xs text-gray-600 mt-4">
            SpotifySpel v0.2.0 (Demo Build)
          </p>
        </section>
      </div>
    </div>
  );
};
