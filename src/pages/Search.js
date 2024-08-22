import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet'; // Import React Helmet
import '../styles/App.css';

const Search = () => {
  const token = localStorage.getItem('spotify_token'); // Get token from localStorage
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trackFeatures, setTrackFeatures] = useState({});
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
      const trackIds = response.data.tracks.items.map(track => track.id).join(',');

      // Fetch audio features for the searched tracks
      const featuresResponse = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const features = {};
      featuresResponse.data.audio_features.forEach(feature => {
        features[feature.id] = feature;
      });
      setTrackFeatures(features);
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
    <>
      <Helmet>
        <title>Search for Songs</title>
        <meta name="description" content="Search for your favorite songs on Spotify, view track details, and listen to previews." />
        <meta property="og:title" content="Search for Songs" />
        <meta property="og:description" content="Find and listen to songs from Spotify. Search for tracks, view their features, and add them to your liked songs." />
        <meta property="og:url" content="https://spotify-dashboard-jet.vercel.app/search" />
      </Helmet>
      <main className="flex flex-col min-h-screen bg-gray-900 text-white">
        <header className="text-center my-8">
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
        </header>

        {results.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {results.map((track) => (
              <article key={track.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
                <img src={track.album.images[0]?.url} alt={track.name} className="rounded-lg w-full h-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{track.name}</h3>
                <p className="text-sm text-gray-400">{track.artists.map(artist => artist.name).join(', ')}</p>

                {trackFeatures[track.id] && (
                  <div className="space-y-2 mb-4">
                    {['acousticness', 'danceability', 'energy', 'instrumentalness', 'valence'].map(metric => {
                      const metricValue = trackFeatures[track.id][metric] * 100;
                      const barWidth = metricValue;

                      return (
                        <div key={metric} className="flex items-center space-x-2">
                          <span className="w-32 text-sm font-semibold">
                            {metric.charAt(0).toUpperCase() + metric.slice(1)}
                          </span>
                          <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1DB954] flex items-center relative"
                              style={{ width: `${barWidth}%` }}
                            >
                              <span
                                className={`text-white text-xs absolute`}
                                style={{
                                  left:
                                    barWidth < 10
                                      ? 'calc(100% + 5px)' // Place outside if too small
                                      : barWidth < 25
                                      ? `${barWidth + 3}%` // Slightly offset for small bars
                                      : `${barWidth - 10}%`, // Center for larger bars
                                }}
                              >
                                {metricValue.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
              </article>
            ))}
          </section>
        )}

        <audio ref={audioRef} />
      </main>
    </>
  );
};

export default Search;
