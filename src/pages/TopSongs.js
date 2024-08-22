import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet'; // Import React Helmet
import '../styles/App.css';

const TopSongs = () => {
  const [token, setToken] = useState(localStorage.getItem('spotify_token'));
  const [topTracks, setTopTracks] = useState([]);
  const [trackFeatures, setTrackFeatures] = useState({});
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
      axios.get('https://api.spotify.com/v1/me/top/tracks?limit=40', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setTopTracks(response.data.items);
        const trackIds = response.data.items.map(track => track.id).join(',');

        // Fetch audio features for the top tracks
        axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(res => {
          const features = {};
          res.data.audio_features.forEach(feature => {
            features[feature.id] = feature;
          });
          setTrackFeatures(features);
        })
        .catch(error => console.error('Error fetching track features:', error));
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

  return (
    <>
      <Helmet>
        <title>Your Top Songs</title>
        <meta name="description" content="Explore and listen to your top tracks on Spotify. Get detailed audio features and enjoy music previews." />
        <meta property="og:title" content="Your Top Songs" />
        <meta property="og:description" content="Discover your top songs on Spotify, including detailed audio features and preview options." />
        <meta property="og:url" content="https://spotify-dashboard-jet.vercel.app/top-songs" />
      </Helmet>
      <main className="flex flex-col min-h-screen bg-gray-900 text-white">
        <header className="text-center my-8">
          <h1 className="text-3xl font-bold mb-4">Your Top Songs</h1>
          {!token ? (
            <p className="text-red-500">Expired or no token. Please log in.</p>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {topTracks.length > 0 ? (
                topTracks.map((track, index) => (
                  <article key={track.id} className="bg-gray-800 rounded-lg p-4 text-center flex flex-col justify-between">
                    <figure>
                      <img src={track.album.images[0]?.url} alt={track.name} className="rounded-lg w-full h-auto mb-4" />
                      <figcaption>
                        <h2 className="text-lg font-semibold mb-2">
                          {index + 1}. {track.name} {/* Display the rank number here */}
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">{track.artists.map(artist => artist.name).join(', ')}</p>
                      </figcaption>
                    </figure>

                    {/* Add metrics (acousticness, danceability, etc.) */}
                    {trackFeatures[track.id] && (
                      <section className="space-y-2 mb-4">
                        {['acousticness', 'danceability', 'energy', 'instrumentalness', 'valence'].map(metric => {
                          const metricValue = trackFeatures[track.id][metric] * 100;
                          const barWidth = metricValue;

                          return (
                            <div key={metric} className="flex items-center space-x-2">
                              <strong className="w-32 text-sm font-semibold">
                                {metric.charAt(0).toUpperCase() + metric.slice(1)}
                              </strong>
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
                      </section>
                    )}

                    <button
                      onClick={() => handlePlayPause(track.id, track.preview_url)}
                      className="bg-[#1DB954] text-white py-2 px-4 rounded-md font-bold transition-colors duration-300 hover:bg-green-400 mt-4"
                    >
                      {playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                    </button>
                  </article>
                ))
              ) : (
                <p className="text-gray-500">No top songs available.</p>
              )}
            </section>
          )}
        </header>
        <audio ref={audioRef} />
      </main>
    </>
  );
};

export default TopSongs;
