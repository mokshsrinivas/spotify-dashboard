import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Ensure this is imported for the styles

const PlaylistSearch = () => {
  const [token, setToken] = useState(localStorage.getItem('spotify_token'));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [playingPlaylistId, setPlayingPlaylistId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'playlist',
          limit: 50 // Request 50 playlists
        }
      });

      setResults(response.data.playlists.items);
    } catch (error) {
      console.error('Error searching for playlists:', error);
    }
  };

  const fetchPreviewForPlaylist = async (playlistId) => {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'playlist',
          limit: 1
        }
      });

      const tracks = response.data?.items;
      if (!Array.isArray(tracks)) {
        console.error('Unexpected response data format:', response.data);
        return '';
      }

      for (const item of tracks) {
        const track = item?.track;
        if (track?.preview_url) {
          return track.preview_url;
        }
      }

      return '';
    } catch (error) {
      console.error('Error fetching preview for playlist:', error);
      return '';
    }
  };

  const handlePlayPause = async (playlistId) => {
    if (playingPlaylistId === playlistId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingPlaylistId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newPreviewUrl = await fetchPreviewForPlaylist(playlistId);
      setPlayingPlaylistId(playlistId);
      if (audioRef.current && newPreviewUrl) {
        audioRef.current.src = newPreviewUrl;
        audioRef.current.play();
      }
    }
  };

  const followPlaylist = async (playlistId) => {
    try {
      await axios.put(
        `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Playlist added to your library!');
    } catch (error) {
      console.error('Error adding playlist to library:', error.response.data);
      alert('Failed to add playlist to your library.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search">
      <h1>Search for Playlists</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a playlist"
      />
      <button onClick={handleSearch}>Search</button>

      {results.length > 0 && (
        <div className="item-grid">
          {results.map((playlist) => (
            <div className="item" key={playlist.id}>
              <img src={playlist.images[0]?.url} alt={playlist.name} />
              <h3>{playlist.name}</h3>
              <p>{playlist.description || 'No description available'}</p>
              <div className="button-group">
                <button onClick={() => handlePlayPause(playlist.id)}>
                  {playingPlaylistId === playlist.id ? 'Pause Preview' : 'Play Preview'}
                </button>
                <button onClick={() => followPlaylist(playlist.id)}>
                  Add to Library
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

export default PlaylistSearch;
