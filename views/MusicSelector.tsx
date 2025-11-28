
import React, { useState } from 'react';
import { Search, Plus, X, Play, CheckCircle } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Song } from '../types';
import { searchTracks } from '../services/spotifyService';

interface MusicSelectorProps {
  onConfirmSelection: (theme: string, songs: Song[]) => void;
  accessToken: string;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({ onConfirmSelection, accessToken }) => {
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real search function with debounce simulated by timeout or just direct call for MVP
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchTracks(val, accessToken);
        setSearchResults(results);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Fout bij zoeken: " + (err.message || "Onbekend"));
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addSong = (song: Song) => {
    if (selectedSongs.length < 5 && !selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
      setQuery('');
      setSearchResults([]);
    }
  };

  const removeSong = (id: string) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-spotify-dark">
      {/* Header */}
      <div className="p-4 bg-spotify-dark border-b border-gray-800 sticky top-0 z-10">
        <h2 className="text-lg font-bold mb-1">Kies jouw 5 nummers</h2>
        <p className="text-xs text-spotify-grey mb-4">Verberg een geheim thema in je selectie.</p>

        <Input
          placeholder="Geheim thema (bv. 'Kleuren in titel')"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="mb-4 border-spotify-green/30"
        />

        <div className="relative">
          <Input
            icon={<Search size={18} />}
            placeholder="Zoek op titel of artiest..."
            value={query}
            onChange={handleSearch}
            autoFocus
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Search Results */}
        {(query.length > 0 || isSearching || error) && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase">Resultaten</h3>
            {error && <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{error}</div>}
            {isSearching ? <p className="text-sm text-gray-500">Zoeken...</p> :
              searchResults.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Geen nummers gevonden</p>
              ) : (
                searchResults.map(song => (
                  <div key={song.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/10 transition-colors group">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img src={song.coverUrl} alt="cover" className="w-full h-full rounded shadow" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => addSong(song)}
                      disabled={selectedSongs.length >= 5 || !!selectedSongs.find(s => s.id === song.id)}
                      className="p-2 rounded-full border border-gray-600 hover:border-spotify-green hover:text-spotify-green disabled:opacity-30 disabled:border-gray-800"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))
              )}
          </div>
        )}

        {/* Selected List */}
        <div className="pb-24">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase">Jouw Selectie</h3>
            <span className={`text-xs font-bold ${selectedSongs.length === 5 ? 'text-spotify-green' : 'text-gray-500'}`}>
              {selectedSongs.length}/5
            </span>
          </div>

          {selectedSongs.length === 0 ? (
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-600">
              <p className="text-sm">Zoek en voeg nummers toe</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSongs.map((song, index) => (
                <div key={song.id} className="flex items-center gap-3 p-3 bg-spotify-light rounded-lg border-l-4 border-spotify-green animate-fadeIn">
                  <span className="text-sm font-bold w-4 text-center text-gray-500">{index + 1}</span>
                  <img src={song.coverUrl} alt="cover" className="w-10 h-10 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                  <button onClick={() => removeSong(song.id)} className="text-gray-500 hover:text-red-400 p-2">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent max-w-md mx-auto pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            fullWidth
            onClick={() => onConfirmSelection(theme, selectedSongs)}
            disabled={selectedSongs.length < 5 || theme.length < 3}
            className="shadow-2xl shadow-green-500/20"
          >
            Bevestig Ronde <CheckCircle size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
