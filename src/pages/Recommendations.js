import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet'; // Import React Helmet
import '../styles/App.css';

const Recommendations = () => {
  const token = localStorage.getItem('spotify_token');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trackFeatures, setTrackFeatures] = useState({});
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const audioRef = useRef(null);

  const handleSearch = useCallback(async () => {
    if (!query) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: 10
        }
      });

      setSearchResults(response.data.tracks.items);
      const trackIds = response.data.tracks.items.map(track => track.id).join(',');

      const featuresResponse = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newFeatures = {};
      featuresResponse.data.audio_features.forEach(feature => {
        newFeatures[feature.id] = feature;
      });

      setTrackFeatures(prevFeatures => ({
        ...prevFeatures,
        ...newFeatures
      }));
    } catch (error) {
      console.error('Error searching for tracks:', error);
      alert("Invalid token. Log in first");
    }
  }, [query, token]);

  const fetchRecommendations = useCallback(async () => {
    if (selectedTracks.length === 0) return;

    try {
      const trackIds = selectedTracks.map(track => track.id).join(',');
      const response = await axios.get('https://api.spotify.com/v1/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          seed_tracks: trackIds,
          limit: 20
        }
      });

      setRecommendations(response.data.tracks);

      const recommendedTrackIds = response.data.tracks.map(track => track.id).join(',');
      const featuresResponse = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${recommendedTrackIds}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newFeatures = {};
      featuresResponse.data.audio_features.forEach(feature => {
        newFeatures[feature.id] = feature;
      });

      setTrackFeatures(prevFeatures => ({
        ...prevFeatures,
        ...newFeatures
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, [selectedTracks, token]);

  useEffect(() => {
    if (query) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [query, handleSearch]);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedTracks, fetchRecommendations]);

  const handleSelectTrack = (track) => {
    if (selectedTracks.some(t => t.id === track.id)) {
      alert('This song has already been added to the list.');
      return;
    }

    setSelectedTracks(prev => [...prev, track]);
    setQuery('');
    setSearchResults([]);
    setShowDropdown(false);
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
      alert("Song added to liked songs");
    } catch (error) {
      console.error('Error adding song to Liked Songs:', error);
    }
  };

  const removeTrackFromList = (trackId) => {
    setSelectedTracks(prev => prev.filter(track => track.id !== trackId));
  };

  return (
    <>
      <Helmet>
        <title>Track Recommendations</title>
        <meta name="description" content="Discover new tracks based on your selected songs. View recommendations, track features, and more." />
        <meta property="og:title" content="Track Recommendations" />
        <meta property="og:description" content="Find new music recommendations based on your favorite tracks. Explore track details and features, and manage your selections." />
        <meta property="og:url" content="https://spotify-dashboard-jet.vercel.app/recommendations" />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold mb-4">Recommendations Based on Selected Tracks</h1>
          {!token ? (
            <p className="text-red-500">Expired or no token. Please log in.</p>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Search for a track"
                className="p-2 text-lg rounded-md border border-input text-gray-900"
              />
              {showDropdown && searchResults.length > 0 && (
                <ul className="absolute bg-gray-800 border border-gray-700 rounded-lg mt-1 w-full z-10">
                  {searchResults.map((track) => (
                    <li
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className="p-4 hover:bg-gray-700 cursor-pointer flex items-center"
                    >
                      <img src={track.album.images[0]?.url} alt={track.name} className="rounded-md w-12 h-12 mr-2" />
                      <div>
                        <h3 className="text-lg font-semibold">{track.name}</h3>
                        <p className="text-sm text-gray-400">{track.artists.map(artist => artist.name).join(', ')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="text-center my-8">
          {!token ? (
            <p></p>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">Selected Tracks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {selectedTracks.map(track => (
                  <div key={track.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
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
                                          ? 'calc(100% + 5px)' 
                                          : barWidth < 25
                                          ? `${barWidth + 3}%`
                                          : `${barWidth - 10}%`,
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

                    <div className="mt-auto flex gap-2 justify-between">
                      <button
                        className="bg-[#1DB954] hover:bg-green-400 text-white rounded-md px-4 py-2"
                        onClick={() => handlePlayPause(track.id)}
                      >
                        {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                      </button>
                      <button
                        className="bg-[#1DB954] hover:bg-green-400 text-white rounded-md px-4 py-2"
                        onClick={() => addToLikedSongs(track.id)}
                      >
                        Add to Liked Songs
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2"
                        onClick={() => removeTrackFromList(track.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center my-8">
          {!token ? (
            <p></p>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recommended Tracks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {recommendations.map(track => (
                  <div key={track.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
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
                                          ? 'calc(100% + 5px)' 
                                          : barWidth < 25
                                          ? `${barWidth + 3}%`
                                          : `${barWidth - 10}%`,
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

                    <div className="mt-auto flex gap-2 justify-between">
                      <button
                        className="bg-[#1DB954] hover:bg-green-400 text-white rounded-md px-4 py-2"
                        onClick={() => handlePlayPause(track.id)}
                      >
                        {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                      </button>
                      <button
                        className="bg-[#1DB954] hover:bg-green-400 text-white rounded-md px-4 py-2"
                        onClick={() => handleSelectTrack(track)}
                      >
                        Add to List
                      </button>
                      <button
                        className="bg-[#1DB954] hover:bg-green-400 text-white rounded-md px-4 py-2"
                        onClick={() => addToLikedSongs(track.id)}
                      >
                        Add to Liked Songs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <audio ref={audioRef} />
      </div>
    </>
  );
};

export default Recommendations;
