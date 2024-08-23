import React from 'react';
import { Helmet } from 'react-helmet';

const CLIENT_ID = 'cc085e915c3a444a997efa86c4c2d64c';
const REDIRECT_URI = 'https://spotify-dashboard-jet.vercel.app/callback';
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=user-top-read playlist-modify-public playlist-modify-private playlist-read-collaborative playlist-read-private user-library-modify user-library-read`;

const Login = () => (
  <>
    <Helmet>
      <title>The Spotify Dashboard - Login</title>
      <meta name="description" content="Login to your Spotify account to access the Spotify Dashboard." />
    </Helmet>
    
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <header>
        <h1 className="text-3xl font-bold mb-4">The Spotify Dashboard</h1>
      </header>
      <section>
        <a
          href={AUTH_URL}
          className="bg-[#1DB954] text-white px-6 py-3 rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
        >
          Login with Spotify
        </a>
      </section>
    </main>
  </>
);

export default Login;