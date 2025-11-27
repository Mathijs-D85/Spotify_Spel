
export const SPOTIFY_CLIENT_ID = '9af64d743553409a8dee1af73dd4f51b';

// Dynamisch de redirect URI bepalen op basis van waar de app draait
// Zorg dat deze URI exact overeenkomt in je Spotify Dashboard (bijv. https://jouw-app.vercel.app/callback)
export const REDIRECT_URI = `${window.location.origin}/callback`;

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDPy23V63k6xubpyYPwkPpMHuMIGPKUQdo",
  authDomain: "spotify-spel.firebaseapp.com",
  databaseURL: "https://spotify-spel-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "spotify-spel",
  storageBucket: "spotify-spel.firebasestorage.app",
  messagingSenderId: "22024851172",
  appId: "1:22024851172:web:1b00b3d8a55727357126f1",
  measurementId: "G-2SGV6ZJWHM"
};
