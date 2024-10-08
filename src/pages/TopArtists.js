import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet'; 
import '../styles/App.css';

const TopArtists = () => {
  const [token, setToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [playingArtistId, setPlayingArtistId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1).split('&').reduce((initial, item) => {
      if (item) {
        const parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});

    if (hash.access_token) {
      localStorage.setItem('spotify_token', hash.access_token);
      setToken(hash.access_token);
    } else {
      const storedToken = localStorage.getItem('spotify_token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.get('https://api.spotify.com/v1/me/top/artists?limit=40', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setTopArtists(response.data.items);
      })
      .catch(error => console.error('Error fetching top artists:', error));
    }
  }, [token]);

  const fetchPreviewForArtist = async (artistId) => {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const tracks = response.data.tracks;
      if (tracks.length > 0) {
        return tracks[0].preview_url; 
      }
    } catch (error) {
      console.error('Error fetching preview for artist:', error);
    }
    return '';
  };

  const handlePlayPause = async (artistId) => {
    if (playingArtistId === artistId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingArtistId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newPreviewUrl = await fetchPreviewForArtist(artistId);
      setPlayingArtistId(artistId);
      if (audioRef.current && newPreviewUrl) {
        audioRef.current.src = newPreviewUrl;
        audioRef.current.play();
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Your Top Artists</title>
        <meta name="description" content="View your top artists on Spotify, play previews, and explore your favorite music." />
        <meta property="og:title" content="Your Top Artists" />
        <meta property="og:description" content="Discover and listen to your top artists on Spotify. Enjoy music previews and more." />
        <meta property="og:url" content="https://spotify-dashboard-jet.vercel.app/top-artists" />
      </Helmet>
      <main className="flex flex-col min-h-screen bg-gray-900 text-white">
        <header className="text-center my-8">
          <h1 className="text-3xl font-bold mb-4">Your Top Artists</h1>
          {!token ? (
            <p className="text-red-500">Expired or no token. Please log in.</p>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {topArtists.map((artist, index) => (
                <article key={artist.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
                  <figure>
                    <img src={artist.images[0]?.url} alt={artist.name} className="rounded-lg w-full h-auto mb-4" />
                    <figcaption>
                      <h2 className="text-lg font-semibold mb-2">
                        {index + 1}. {artist.name} 
                      </h2>
                    </figcaption>
                  </figure>
                  <button
                    onClick={() => handlePlayPause(artist.id)}
                    className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400 mt-4"
                  >
                    {playingArtistId === artist.id ? 'Pause Preview' : 'Play Preview'}
                  </button>
                </article>
              ))}
            </section>
          )}
        </header>
        <audio ref={audioRef} />
      </main>
    </>
  );
};

export default TopArtists;
