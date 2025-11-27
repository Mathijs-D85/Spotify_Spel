import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { GameState, User } from '../types';

interface GameOverProps {
    gameState: GameState;
    currentUser: User;
    onBackToHome: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ gameState, currentUser, onBackToHome }) => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const isWinner = winner.id === currentUser.id;

    useEffect(() => {
        // Fire confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#1DB954', '#FFFFFF']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#1DB954', '#FFFFFF']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }, []);

    return (
        <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto pt-12 text-center">
            <div className="mb-8 animate-bounce">
                <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-white uppercase tracking-widest">
                    Spel Afgelopen!
                </h1>
            </div>

            <div className="bg-spotify-light rounded-xl p-6 mb-8 shadow-2xl border border-white/10">
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">De winnaar is</p>
                <div className="flex flex-col items-center gap-4">
                    <img
                        src={winner.avatarUrl}
                        alt={winner.name}
                        className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg"
                    />
                    <div>
                        <h2 className="text-3xl font-bold text-white">{winner.name}</h2>
                        <p className="text-xl text-spotify-green font-mono font-bold">{winner.score} punten</p>
                    </div>
                </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 text-left">Eindstand</h3>
                <div className="space-y-3">
                    {sortedPlayers.map((player, index) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${player.id === currentUser.id ? 'bg-white/10 border border-white/20' : 'bg-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-mono font-bold w-6 ${index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-gray-400' :
                                            index === 2 ? 'text-amber-600' : 'text-gray-600'
                                    }`}>
                                    #{index + 1}
                                </span>
                                <span className="font-medium">{player.name}</span>
                            </div>
                            <span className="font-bold text-spotify-green">{player.score}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <Button fullWidth onClick={onBackToHome}>
                    <Home size={20} /> Terug naar Home
                </Button>
            </div>
        </div>
    );
};
