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
  const [fontSize, setFontSize] = useState(16); // Default font size in px

  const topItemsRef = useRef(null);
  const searchRef = useRef(null);

  const toggleTopItemsDropdown = () => {
    setIsTopItemsDropdownOpen(!isTopItemsDropdownOpen);
    setIsSearchDropdownOpen(false);
  };

  const toggleSearchDropdown = () => {
    setIsSearchDropdownOpen(!isSearchDropdownOpen);
    setIsTopItemsDropdownOpen(false);
  };

  const closeDropdowns = () => {
    setIsTopItemsDropdownOpen(false);
    setIsSearchDropdownOpen(false);
  };

  const increaseFontSize = () => {
    setFontSize((prevSize) => (prevSize < 24 ? prevSize + 2 : prevSize)); // Limit the maximum font size
  };

  const decreaseFontSize = () => {
    setFontSize((prevSize) => (prevSize > 12 ? prevSize - 2 : prevSize)); // Limit the minimum font size
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topItemsRef.current && !topItemsRef.current.contains(event.target)) {
        setIsTopItemsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Router>
      <main className="app">
        <header className="navbar">
          <nav className="navbar-left">
            <Link to="/" className="login-button">Login</Link>
          </nav>
          <section className="navbar-center">
            <div className="dropdown" ref={topItemsRef}>
              <button onClick={toggleTopItemsDropdown} className="navbar-link">
                Your Top Items
              </button>
              {isTopItemsDropdownOpen && (
                <ul className="dropdown-content show">
                  <li><Link to="/top-songs" className="dropdown-item" onClick={closeDropdowns}>Top Songs</Link></li>
                  <li><Link to="/top-artists" className="dropdown-item" onClick={closeDropdowns}>Top Artists</Link></li>
                  <li><Link to="/top-albums" className="dropdown-item" onClick={closeDropdowns}>Top Albums</Link></li>
                </ul>
              )}
            </div>
            <div className="dropdown" ref={searchRef}>
              <button onClick={toggleSearchDropdown} className="navbar-link">
                Search
              </button>
              {isSearchDropdownOpen && (
                <ul className="dropdown-content show">
                  <li><Link to="/search" className="dropdown-item" onClick={closeDropdowns}>Search Songs</Link></li>
                  <li><Link to="/playlist-search" className="dropdown-item" onClick={closeDropdowns}>Search Playlists</Link></li>
                  <li><Link to="/recommendations" className="dropdown-item" onClick={closeDropdowns}>Song Recommendations</Link></li>
                </ul>
              )}
            </div>
          </section>
          <aside className="navbar-right">
            <button onClick={decreaseFontSize} className="font-size-button">A-</button>
            <button onClick={increaseFontSize} className="font-size-button">A+</button>
          </aside>
        </header>

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
      </main>
    </Router>
  );
};

export default App;
