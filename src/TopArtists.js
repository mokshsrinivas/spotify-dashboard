import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
      axios.get('https://api.spotify.com/v1/me/top/artists', {
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
        return tracks[0].preview_url; // Get the preview URL of the top track
      }
    } catch (error) {
      console.error('Error fetching preview for artist:', error);
    }
    return '';
  };

  const handlePlayPause = async (artistId) => {
    if (playingArtistId === artistId) {
      // Pause if the same artist is clicked
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingArtistId(null);
      }
    } else {
      // Stop the previous track and play the new one
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

  if (!token) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="top-artists">
      <h1>Your Top Artists</h1>
      <div className="item-grid">
        {topArtists.map(artist => (
          <div key={artist.id} className="item">
            <img src={artist.images[0]?.url} alt={artist.name} />
            <div>
              <h3>{artist.name}</h3>
              <button
                onClick={() => handlePlayPause(artist.id)}
              >
                {playingArtistId === artist.id ? 'Pause Preview' : 'Play Preview'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default TopArtists;
