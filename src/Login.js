// src/Login.js
import React from 'react';

const CLIENT_ID = 'cc085e915c3a444a997efa86c4c2d64c';
const REDIRECT_URI = 'https://spotify-dashboard-jet.vercel.app/callback';
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=user-top-read playlist-modify-public playlist-modify-private playlist-read-collaborative playlist-read-private user-library-modify user-library-read user-library-modify` ;

const Login = () => (
  <div className="login">
    <h1>Login with Spotify</h1>
    <a href={AUTH_URL} className="login-button">Login</a>
  </div>
);

export default Login;
