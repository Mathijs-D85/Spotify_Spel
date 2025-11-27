import React, { useEffect } from 'react';

interface WebPlayerProps {
  token: string;
  onReady: (deviceId: string) => void;
  onNotReady: () => void;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export const WebPlayer: React.FC<WebPlayerProps> = ({ token, onReady, onNotReady, onError }) => {
  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Spotify Spel Web Player',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        onReady(device_id);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        onNotReady();
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization Error:', message);
        onError(message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication Error:', message);
        onError(message);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account Error:', message);
        onError(message);
      });

      player.connect();
    };

    return () => {
      // Cleanup logic if needed, though SDK doesn't have a clean destroy method that removes the script easily
      // We mainly want to avoid adding multiple scripts
    };
  }, [token]);

  return null; // This component is invisible
};
