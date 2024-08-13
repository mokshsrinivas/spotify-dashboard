import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TopAlbums = () => {
  const [token, setToken] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [albumsWithScores, setAlbumsWithScores] = useState([]);
  const [playingAlbumId, setPlayingAlbumId] = useState(null);
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
    const fetchTopSongs = async () => {
      if (!token) return;

      let allTopSongs = [];
      let next = 'https://api.spotify.com/v1/me/top/tracks?limit=50'; // Start with the first page

      while (next && allTopSongs.length < 100) {
        try {
          const response = await axios.get(next, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          allTopSongs = [...allTopSongs, ...response.data.items];

          next = response.data.next; // Update the URL for the next page
        } catch (error) {
          console.error('Error fetching top songs:', error);
          break;
        }
      }

      setTopSongs(allTopSongs.slice(0, 100)); // Ensure we only keep the top 100 songs
    };

    fetchTopSongs();
  }, [token]);

  useEffect(() => {
    if (token && topSongs.length > 0) {
      const fetchAlbums = async () => {
        const albumScores = new Map();

        // Fetch albums for each top song
        for (const song of topSongs) {
          try {
            const response = await axios.get(`https://api.spotify.com/v1/tracks/${song.id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            const album = response.data.album;
            const albumId = album.id;

            if (!albumScores.has(albumId)) {
              albumScores.set(albumId, {
                album: album,
                score: 0
              });
            }

            // Score based on song ranking
            const rank = topSongs.indexOf(song) + 1; // Rank starts from 1
            const currentScore = albumScores.get(albumId).score;
            albumScores.set(albumId, {
              album: album,
              score: currentScore + (100 - rank) // Higher rank contributes more to the score
            });
          } catch (error) {
            console.error('Error fetching album for song:', error);
          }
        }

        // Convert map to array, sort by score, and slice to top 20
        const sortedAlbums = Array.from(albumScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 20); // Limit to top 20 albums

        setAlbumsWithScores(sortedAlbums);
      };

      fetchAlbums();
    }
  }, [token, topSongs]);

  const fetchPreviewForAlbum = async (albumId) => {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const tracks = response.data.items;
      if (tracks.length > 0) {
        return tracks[0].preview_url; // Get the preview URL of the first track
      }
    } catch (error) {
      console.error('Error fetching preview for album:', error);
    }
    return '';
  };

  const handlePlayPause = async (albumId) => {
    if (playingAlbumId === albumId) {
      // Pause if the same album is clicked
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAlbumId(null);
      }
    } else {
      // Stop the previous track and play the new one
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newPreviewUrl = await fetchPreviewForAlbum(albumId);
      setPlayingAlbumId(albumId);
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
    <div className="top-albums">
      <h1>Your Top Albums</h1>
      <div className="item-grid">
        {albumsWithScores.map(({ album }) => (
          <div key={album.id} className="item">
            <img src={album.images[0]?.url} alt={album.name} />
            <div>
              <h3>{album.name}</h3>
              <p>{album.artists.map(artist => artist.name).join(', ')}</p>
              <button
                onClick={() => handlePlayPause(album.id)}
              >
                {playingAlbumId === album.id ? 'Pause Preview' : 'Play Preview'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default TopAlbums;
