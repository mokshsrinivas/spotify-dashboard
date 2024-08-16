import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/App.css';

const TopSongs = () => {
  const [token, setToken] = useState(localStorage.getItem('spotify_token'));
  const [topTracks, setTopTracks] = useState([]);
  const [playingTrackId, setPlayingTrackId] = useState(null);
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
      axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setTopTracks(response.data.items);
      })
      .catch(error => console.error('Error fetching top tracks:', error));
    }
  }, [token]);

  const handlePlayPause = (trackId, previewUrl) => {
    if (playingTrackId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(trackId);
      if (audioRef.current) {
        audioRef.current.src = previewUrl;
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="text-center my-8">
        <h1 className="text-3xl font-bold mb-4">Your Top Songs</h1>
        {!token ? (
          <p className="text-red-500">Expired or no token. Please log in.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {topTracks.length > 0 ? (
              topTracks.map(track => (
                <div key={track.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
                  <img src={track.album.images[0]?.url} alt={track.name} className="rounded-lg w-full h-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{track.name}</h3>
                  <p className="text-sm text-gray-400">{track.artists.map(artist => artist.name).join(', ')}</p>
                  <button
                    onClick={() => handlePlayPause(track.id, track.preview_url)}
                    className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400 mt-4"
                  >
                    {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No top songs available.</p>
            )}
          </div>
        )}
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default TopSongs;
