import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet'; // Import React Helmet
import '../styles/App.css';

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
          limit: 50
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

  // Function to strip HTML tags from the description
  const stripHtmlTags = (htmlString) => {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || '';
  };

  return (
    <>
      <Helmet>
        <title>Search for Playlists</title>
        <meta name="description" content="Search for playlists on Spotify, view playlist details, and listen to previews of tracks." />
        <meta property="og:title" content="Search for Playlists" />
        <meta property="og:description" content="Find and explore playlists from Spotify. Search for playlists, view their details, and listen to previews of tracks." />
        <meta property="og:url" content="https://spotify-dashboard-jet.vercel.app/playlist-search" />
      </Helmet>
      <main className="flex flex-col min-h-screen bg-gray-900 text-white">
        <header className="text-center my-8">
          <h1 className="text-3xl font-bold mb-4">Search for Playlists</h1>
          {!token ? (
            <p className="text-red-500">Expired or no token. Please log in.</p>
          ) : (
            <div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for a playlist"
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
        </header>

        {results.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {results.map((playlist) => (
              <article key={playlist.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
                <img src={playlist.images[0]?.url} alt={playlist.name} className="rounded-lg w-full h-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{playlist.name}</h3>
                <p className="text-sm text-gray-400">
                  {stripHtmlTags(playlist.description) || 'No description available'}
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={() => handlePlayPause(playlist.id)}
                    className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
                  >
                    {playingPlaylistId === playlist.id ? 'Pause Preview' : 'Play Preview'}
                  </button>
                  <button
                    onClick={() => followPlaylist(playlist.id)}
                    className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400"
                  >
                    Add to Library
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        <audio ref={audioRef} />
      </main>
    </>
  );
};

export default PlaylistSearch;
