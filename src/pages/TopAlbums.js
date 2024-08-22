import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet'; // Import React Helmet
import '../styles/App.css';

const TopAlbums = () => {
  const [token, setToken] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [albumsWithScores, setAlbumsWithScores] = useState([]);
  const [playingAlbumId, setPlayingAlbumId] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
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
    const fetchAlbums = async () => {
      if (token && topSongs.length > 0) {
        setLoading(true); // Set loading to true before fetching

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

        const sortedAlbums = Array.from(albumScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 20); // Limit to top 20 albums

        setAlbumsWithScores(sortedAlbums);
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchAlbums();
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

  return (
    <>
      <Helmet>
        <title>Your Top Albums</title>
        <meta name="description" content="Discover your top albums on Spotify. View detailed scores based on top songs and listen to previews." />
        <meta property="og:title" content="Your Top Albums" />
        <meta property="og:description" content="Explore and listen to your top albums on Spotify, with detailed scores and previews based on your favorite tracks." />
        <meta property="og:url" content="https://spotify-dashboard-jet.vercel.app/top-albums" />
      </Helmet>
      <main className="flex flex-col min-h-screen bg-gray-900 text-white">
        <header className="text-center my-8">
          <h1 className="text-3xl font-bold mb-4">Your Top Albums</h1>
          {!token ? (
            <p className="text-red-500">Expired or no token. Please log in.</p>
          ) : (
            <div>
              {loading ? (
                <div className="text-center text-xl">Loading...</div>
              ) : (
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                  {albumsWithScores.map(({ album }, index) => (
                    <article key={album.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
                      <img src={album.images[0]?.url} alt={album.name} className="rounded-lg w-full h-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {index + 1}. {album.name} {/* Display the rank number here */}
                      </h3>
                      <p className="text-sm text-gray-400">{album.artists.map(artist => artist.name).join(', ')}</p>
                      <button
                        onClick={() => handlePlayPause(album.id)}
                        className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400 mt-4"
                      >
                        {playingAlbumId === album.id ? 'Pause Preview' : 'Play Preview'}
                      </button>
                    </article>
                  ))}
                </section>
              )}
            </div>
          )}
        </header>
        <audio ref={audioRef} />
      </main>
    </>
  );
};

export default TopAlbums;
