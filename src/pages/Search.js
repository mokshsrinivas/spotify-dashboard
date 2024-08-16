// src/Search.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../styles/App.css';

const Search = () => {
  const token = localStorage.getItem('spotify_token'); // Get token from localStorage
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRef = useRef(null);

  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: 50 
        }
      });

      setResults(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching for tracks:', error);
      alert("Invalid token. Log in first");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchPreviewForTrack = async (trackId) => {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.preview_url;
    } catch (error) {
      console.error('Error fetching preview for track:', error);
    }
    return '';
  };

  const handlePlayPause = async (trackId) => {
    if (playingTrackId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newPreviewUrl = await fetchPreviewForTrack(trackId);
      setPlayingTrackId(trackId);
      if (audioRef.current && newPreviewUrl) {
        audioRef.current.src = newPreviewUrl;
        audioRef.current.play();
      }
    }
  };

  const addToLikedSongs = async (trackId) => {
    try {
      await axios.put(`https://api.spotify.com/v1/me/tracks`, [trackId], {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Song added to your Liked Songs!');
    } catch (error) {
      console.error('Error adding song to Liked Songs:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="text-center my-8">
        <h1 className="text-3xl font-bold mb-4">Search for a Song</h1>
        {!token ? (
          <p className="text-red-500">Expired or no token. Please log in.</p>
        ) : (
          <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a song"
            className="p-2 text-lg rounded-md border border-input text-gray-900"
          />
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-[#1DB954] text-white rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
          >
            Search
          </button>
          </div>
        )}
        
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {results.map((track) => (
            <div key={track.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
              <img src={track.album.images[0]?.url} alt={track.name} className="rounded-lg w-full h-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{track.name}</h3>
              <p className="text-sm text-gray-400">{track.artists.map(artist => artist.name).join(', ')}</p>
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={() => handlePlayPause(track.id)}
                  className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
                >
                  {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                </button>
                <button
                  onClick={() => addToLikedSongs(track.id)}
                  className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
                >
                  Add to Liked Songs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};

export default Search;
