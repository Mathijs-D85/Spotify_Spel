import { Song } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    coverUrl: 'https://picsum.photos/seed/queen/64/64',
    previewUrl: null
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://picsum.photos/seed/weeknd/64/64',
    previewUrl: null
  },
  {
    id: '3',
    title: 'As It Was',
    artist: 'Harry Styles',
    coverUrl: 'https://picsum.photos/seed/harry/64/64',
    previewUrl: null
  },
  {
    id: '4',
    title: 'Roller Coaster',
    artist: 'Danny Vera',
    coverUrl: 'https://picsum.photos/seed/danny/64/64',
    previewUrl: null
  },
  {
    id: '5',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    coverUrl: 'https://picsum.photos/seed/ed/64/64',
    previewUrl: null
  },
   {
    id: '6',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    coverUrl: 'https://picsum.photos/seed/billie/64/64',
    previewUrl: null
  },
];

export const DIFFICULTY_LABELS = {
  easy: 'Eenvoudig (1pt)',
  medium: 'Gemiddeld (3pt)',
  hard: 'Moeilijk (5pt)'
};