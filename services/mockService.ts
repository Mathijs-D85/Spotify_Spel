import { User } from '../types';

// Simulatie van Spotify Auth
export const mockLogin = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user_' + Math.floor(Math.random() * 1000),
        name: 'Demo Speler',
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/200`,
        isHost: false,
        score: 0
      });
    }, 800);
  });
};

export const generateGameCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};