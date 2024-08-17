// src/Login.js
import React from 'react';

const CLIENT_ID = 'cc085e915c3a444a997efa86c4c2d64c';
const REDIRECT_URI = 'http://localhost:3000/callback';
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=user-top-read playlist-modify-public playlist-modify-private playlist-read-collaborative playlist-read-private user-library-modify user-library-read user-library-modify`;

const Login = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
    <h1 className="text-3xl font-bold mb-4">The Spotify Dashboard</h1>
    <a
      href={AUTH_URL}
      className="bg-[#1DB954] text-white px-6 py-3 rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
    >
      Login with Spotify
    </a>
  </div>
);

export default Login;
