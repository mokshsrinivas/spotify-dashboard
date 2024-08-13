import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

const Search = () => {
  const token = useState(localStorage.getItem('spotify_token'));
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
          limit: 50 // Request 50 results
        }
      });

      setResults(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching for tracks:', error);
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
      alert('Failed to add song to Liked Songs.');
    }
  };

  return (
    <div className="search">
      <h1>Search for a Song</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a song"
      />
      <button onClick={handleSearch}>Search</button>

      {results.length > 0 && (
        <div className="item-grid">
          {results.map((track) => (
            <div className="item" key={track.id}>
              <img src={track.album.images[0]?.url} alt={track.name} />
              <h3>{track.name}</h3>
              <p>{track.artists.map(artist => artist.name).join(', ')}</p>
              <div className="button-group">
                <button
                  onClick={() => handlePlayPause(track.id)}
                >
                  {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                </button>
                <button
                  onClick={() => addToLikedSongs(track.id)}
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
