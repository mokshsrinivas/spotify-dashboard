// src/TopSongs.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TopSongs = () => {
  const [token, setToken] = useState(null);
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

  if (!token) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="top-songs">
      <h1>Your Top Songs</h1>
      <div className="item-grid">
        {topTracks.map(track => (
          <div key={track.id} className="item">
            <img src={track.album.images[0]?.url} alt={track.name} />
            <div>
              <h3>{track.name}</h3>
              <p>{track.artists.map(artist => artist.name).join(', ')}</p>
              <button
                onClick={() => handlePlayPause(track.id, track.preview_url)}
              >
                {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default TopSongs;