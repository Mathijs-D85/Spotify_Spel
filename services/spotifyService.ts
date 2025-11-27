
import { SPOTIFY_CLIENT_ID, REDIRECT_URI } from '../config';
import { Song, User } from '../types';
import { MOCK_SONGS } from '../constants'; // We need constants back or define mock data here

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'playlist-read-private',
  'playlist-modify-public',
  'user-read-playback-state',
  'user-modify-playback-state'
];

// PKCE Helpers
const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const loginToSpotify = async () => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const loginAsDemoUser = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'demo_user_' + Math.floor(Math.random() * 1000),
        name: 'Demo Speler',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        isHost: false,
        score: 0,
        accessToken: 'mock_token'
      });
    }, 800);
  });
};

export const getTokenFromCode = async (code: string): Promise<string> => {
  const codeVerifier = window.localStorage.getItem('spotify_code_verifier');

  if (!codeVerifier) {
    throw new Error('Code verifier niet gevonden. Probeer opnieuw in te loggen.');
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  };

  const response = await fetch('https://accounts.spotify.com/api/token', payload);
  const data = await response.json();

  if (data.access_token) {
    window.localStorage.setItem('spotify_access_token', data.access_token);
    return data.access_token;
  } else {
    throw new Error(data.error_description || 'Kon geen toegangstoken ophalen.');
  }
};

export const getStoredToken = () => {
  return window.localStorage.getItem('spotify_access_token');
};

// API Calls
export const getCurrentUserProfile = async (accessToken: string): Promise<User> => {
  if (accessToken === 'mock_token') {
    return loginAsDemoUser();
  }

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Spotify API Error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.id) {
    throw new Error("Ongeldig gebruikersprofiel ontvangen van Spotify.");
  }

  return {
    id: data.id,
    name: data.display_name || 'Spotify User',
    avatarUrl: data.images?.[0]?.url || 'https://via.placeholder.com/150',
    isHost: false,
    score: 0,
    accessToken
  };
};

export const searchTracks = async (query: string, accessToken: string): Promise<Song[]> => {
  if (!query) return [];

  // MOCK FALLBACK
  if (accessToken === 'mock_token') {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_SONGS.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase())));
      }, 300);
    });
  }

  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Sessie verlopen. Log opnieuw in.");
    throw new Error("Fout bij zoeken naar nummers.");
  }

  const data = await response.json();

  return data.tracks.items.map((item: any) => ({
    id: item.id,
    title: item.name,
    artist: item.artists.map((a: any) => a.name).join(', '),
    coverUrl: item.album.images[2]?.url || item.album.images[0]?.url,
    previewUrl: item.preview_url,
    uri: item.uri
  }));
};

export const playTrack = async (deviceId: string, spotifyUri: string, accessToken: string) => {
  if (accessToken === 'mock_token') {
    console.log("Mock Playing:", spotifyUri);
    return;
  }

  // If we have a specific device ID (from Web Player), use it
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify({ uris: [spotifyUri] }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  });
};

export const pausePlayer = async (deviceId: string, accessToken: string) => {
  if (accessToken === 'mock_token') {
    console.log("Mock Paused");
    return;
  }
  await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
  });
}
