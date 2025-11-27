import React from 'react';
import { Trophy, ArrowRight, Music } from 'lucide-react';
import { Button } from '../components/Button';
import { GameState, User } from '../types';

interface ResultsProps {
    gameState: GameState;
    currentUser: User;
    onNextRound: () => void;
}

export const Results: React.FC<ResultsProps> = ({ gameState, currentUser, onNextRound }) => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const roundData = gameState.activeRoundData;

    return (
        <div className="flex flex-col min-h-screen max-w-md mx-auto p-6 space-y-6 pb-20">
            <header className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Ronde Uitslag</h2>
                <p className="text-spotify-grey">Ronde {gameState.currentRound} van {gameState.totalRounds}</p>
            </header>

            {/* Correct Answers */}
            <div className="bg-spotify-light rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-spotify-green flex items-center gap-2">
                    <Music size={18} /> Antwoorden
                </h3>

                {roundData && (
                    <div className="space-y-3">
                        <div className="border-b border-white/10 pb-2">
                            <p className="text-xs text-gray-400 uppercase">Thema</p>
                            <p className="font-bold text-lg">{roundData.theme}</p>
                        </div>

                        <div className="space-y-2">
                            {roundData.songs.map((song, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded" />
                                    <div className="min-w-0">
                                        <p className="font-bold truncate text-sm">{song.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                <h3 className="font-bold text-spotify-green flex items-center gap-2">
                    <Trophy size={18} /> Tussenstand
                </h3>

                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${player.id === currentUser.id ? 'bg-white/10 border border-spotify-green' : 'bg-spotify-light'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold w-6 text-center ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                #{index + 1}
                            </span>
                            <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full" />
                            <span className={player.id === currentUser.id ? 'font-bold' : ''}>{player.name}</span>
                        </div>
                        <span className="font-bold text-spotify-green">{player.score} pt</span>
                    </div>
                ))}
            </div>

            {/* Next Round Action */}
            {currentUser.isHost && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <div className="max-w-md mx-auto">
                        <Button fullWidth onClick={onNextRound}>
                            {gameState.currentRound >= gameState.totalRounds ? 'Spel Afronden' : 'Volgende Ronde'} <ArrowRight size={20} />
                        </Button>
                    </div>
                </div>
            )}

            {!currentUser.isHost && (
                <div className="text-center text-sm text-gray-500 animate-pulse mt-8">
                    Wachten op de host...
                </div>
            )}
        </div>
    );
};
