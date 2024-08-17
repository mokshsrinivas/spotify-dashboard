import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import TopSongs from './pages/TopSongs';
import TopArtists from './pages/TopArtists';
import TopAlbums from './pages/TopAlbums';
import Search from './pages/Search';
import PlaylistSearch from './pages/PlaylistSearch';
import Recommendations from './pages/Recommendations';
import './styles/App.css';

const App = () => {
  const [isTopItemsDropdownOpen, setIsTopItemsDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const topItemsDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);

  const toggleTopItemsDropdown = () => {
    setIsTopItemsDropdownOpen(!isTopItemsDropdownOpen);
    setIsSearchDropdownOpen(false); // Close the other dropdown when one is opened
  };

  const toggleSearchDropdown = () => {
    setIsSearchDropdownOpen(!isSearchDropdownOpen);
    setIsTopItemsDropdownOpen(false); // Close the other dropdown when one is opened
  };

  const closeDropdowns = () => {
    setIsTopItemsDropdownOpen(false);
    setIsSearchDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        topItemsDropdownRef.current && 
        !topItemsDropdownRef.current.contains(event.target) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target)
      ) {
        closeDropdowns();
      }
    };

    if (isTopItemsDropdownOpen || isSearchDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isTopItemsDropdownOpen, isSearchDropdownOpen]);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-left">
            <Link to="/" className="login-button">Login</Link>
          </div>
          <div className="navbar-center">
            <div className="dropdown" ref={topItemsDropdownRef}>
              <button onClick={toggleTopItemsDropdown} className="navbar-link">
                Your Top Items
              </button>
              {isTopItemsDropdownOpen && (
                <div className="dropdown-content show">
                  <Link to="/top-songs" className="dropdown-item" onClick={closeDropdowns}>Top Songs</Link>
                  <Link to="/top-artists" className="dropdown-item" onClick={closeDropdowns}>Top Artists</Link>
                  <Link to="/top-albums" className="dropdown-item" onClick={closeDropdowns}>Top Albums</Link>
                </div>
              )}
            </div>
            <div className="dropdown" ref={searchDropdownRef}>
              <button onClick={toggleSearchDropdown} className="navbar-link">
                Search
              </button>
              {isSearchDropdownOpen && (
                <div className="dropdown-content show">
                  <Link to="/search" className="dropdown-item" onClick={closeDropdowns}>Search Songs</Link>
                  <Link to="/playlist-search" className="dropdown-item" onClick={closeDropdowns}>Search Playlists</Link>
                  <Link to="/recommendations" className="dropdown-item" onClick={closeDropdowns}>Song Recommendations</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<TopSongs />} />
          <Route path="/top-songs" element={<TopSongs />} />
          <Route path="/top-artists" element={<TopArtists />} />
          <Route path="/top-albums" element={<TopAlbums />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist-search" element={<PlaylistSearch />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
