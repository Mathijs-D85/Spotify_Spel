import React, { useState } from 'react';
import { Check, X, ArrowRight, Music, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { GameState, User, Round } from '../types';

interface ScoringProps {
    gameState: GameState;
    currentUser: User;
    onConfirmScores: (updatedPlayers: User[]) => void;
}

export const Scoring: React.FC<ScoringProps> = ({ gameState, currentUser, onConfirmScores }) => {
    const roundData = gameState.activeRoundData;
    const [scores, setScores] = useState<Record<string, { songPoints: Record<string, number>, themePoints: number }>>({});

    if (!roundData) return <div>Geen rondedata beschikbaar</div>;

    // Only the selector (who acts as host for this round's content) can score
    // Note: In our rotation logic, the 'isHost' flag rotates. 
    // During 'scoring' phase, the person who WAS the selector is still the one who knows the answers best?
    // Or is it the main host? The user said: "gene die de ronde is gestart en de liedjes ingeeft".
    // That is the 'selectorId'.
    // Let's check if currentUser.id === roundData.selectorId OR currentUser.isHost (as fallback/admin).
    const canScore = currentUser.id === roundData.selectorId || currentUser.isHost;

    if (!canScore) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
                <h2 className="text-xl font-bold text-white">Antwoorden nakijken...</h2>
                <p className="text-gray-400">De host controleert nu de antwoorden.</p>
            </div>
        );
    }

    // Initialize scores if empty
    if (Object.keys(scores).length === 0) {
        const initialScores: any = {};
        gameState.players.forEach(player => {
            if (player.id === roundData.selectorId) return;

            const playerGuesses = roundData.guesses[player.id];
            initialScores[player.id] = {
                songPoints: {},
                themePoints: 0
            };

            // Pre-fill based on simple matching (optional helper)
            roundData.songs.forEach(song => {
                const guess = playerGuesses?.songGuesses?.[song.id];
                let points = 0;
                if (guess?.title && song.title.toLowerCase().includes(guess.title.toLowerCase())) points += 1;
                if (guess?.artist && song.artist.toLowerCase().includes(guess.artist.toLowerCase())) points += 1;
                initialScores[player.id].songPoints[song.id] = points;
            });

            if (playerGuesses?.themeGuess && roundData.theme.toLowerCase().includes(playerGuesses.themeGuess.toLowerCase())) {
                initialScores[player.id].themePoints = 3;
            }
        });
        setScores(initialScores);
        return <div>Scores laden...</div>; // Re-render with state
    }

    const toggleSongPoint = (playerId: string, songId: string, type: 'title' | 'artist') => {
        setScores(prev => {
            const currentPoints = prev[playerId].songPoints[songId] || 0;
            let newPoints = (currentPoints + 1) % 3;

            return {
                ...prev,
                [playerId]: {
                    ...prev[playerId],
                    songPoints: {
                        ...prev[playerId].songPoints,
                        [songId]: newPoints
                    }
                }
            };
        });
    };

    const toggleThemePoints = (playerId: string) => {
        setScores(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                themePoints: prev[playerId].themePoints === 0 ? 3 : 0
            }
        }));
    };

    const handleConfirm = () => {
        const updatedPlayers = gameState.players.map(player => {
            if (player.id === roundData.selectorId) return player;

            const playerScores = scores[player.id];
            if (!playerScores) return player;

            const totalRoundScore = (Object.values(playerScores.songPoints) as number[]).reduce((a, b) => a + b, 0) + playerScores.themePoints;

            return { ...player, score: player.score + totalRoundScore };
        });

        onConfirmScores(updatedPlayers);
    };

    return (
        <div className="flex flex-col min-h-screen max-w-2xl mx-auto p-4 space-y-6 pb-20">
            <header className="text-center">
                <h2 className="text-2xl font-bold text-white">Quizmaster Mode</h2>
                <p className="text-spotify-grey">Controleer de antwoorden</p>
            </header>

            <div className="space-y-8">
                {gameState.players.map(player => {
                    if (player.id === roundData.selectorId) return null;
                    const playerGuesses = roundData.guesses[player.id];
                    const playerScores = scores[player.id];

                    if (!playerGuesses || !playerScores) return null;

                    return (
                        <div key={player.id} className="bg-spotify-light rounded-xl overflow-hidden border border-white/5">
                            <div className="bg-white/5 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={player.avatarUrl} className="w-8 h-8 rounded-full" />
                                    <span className="font-bold">{player.name}</span>
                                </div>
                                <div className="font-mono text-spotify-green font-bold">
                                    {(Object.values(playerScores.songPoints) as number[]).reduce((a, b) => a + b, 0) + playerScores.themePoints} pt
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {roundData.songs.map(song => {
                                    const guess = playerGuesses.songGuesses?.[song.id];
                                    const points = playerScores.songPoints[song.id] || 0;

                                    return (
                                        <div key={song.id} className="grid grid-cols-12 gap-4 items-center border-b border-white/5 pb-4 last:border-0">
                                            {/* Correct Answer */}
                                            <div className="col-span-4 text-xs text-gray-400">
                                                <div className="font-bold text-white truncate">{song.title}</div>
                                                <div className="truncate">{song.artist}</div>
                                            </div>

                                            {/* Player Guess */}
                                            <div className="col-span-5 text-sm">
                                                <div className={`${!guess?.title ? 'text-gray-600 italic' : ''}`}>
                                                    {guess?.title || '-'}
                                                </div>
                                                <div className={`${!guess?.artist ? 'text-gray-600 italic' : ''}`}>
                                                    {guess?.artist || '-'}
                                                </div>
                                            </div>

                                            {/* Scoring Controls */}
                                            <div className="col-span-3 flex justify-end">
                                                <button
                                                    onClick={() => toggleSongPoint(player.id, song.id, 'title')}
                                                    className={`px-3 py-1 rounded font-bold text-xs transition-colors ${points === 2 ? 'bg-green-500 text-black' :
                                                        points === 1 ? 'bg-yellow-500 text-black' :
                                                            'bg-red-500/20 text-red-500'
                                                        }`}
                                                >
                                                    {points === 2 ? '2 pt' : points === 1 ? '1 pt' : '0 pt'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Theme Guess */}
                                <div className="bg-black/20 p-3 rounded flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase mb-1">Thema: {roundData.theme}</div>
                                        <div className="font-bold">{playerGuesses.themeGuess || '-'}</div>
                                    </div>
                                    <button
                                        onClick={() => toggleThemePoints(player.id)}
                                        className={`px-3 py-1 rounded font-bold text-xs transition-colors ${playerScores.themePoints === 3 ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
                                            }`}
                                    >
                                        {playerScores.themePoints === 3 ? '3 pt' : '0 pt'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <div className="max-w-2xl mx-auto">
                    <Button fullWidth onClick={handleConfirm}>
                        Scores Bevestigen <ArrowRight size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
