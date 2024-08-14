// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Login';
import TopSongs from './TopSongs';
import TopArtists from './TopArtists';
import TopAlbums from './TopAlbums';
import Search from './Search';
import PlaylistSearch from './PlaylistSearch';

import './App.css';

const App = () => (
  <Router>
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="navbar-link">Login</Link>
        <Link to="/top-songs" className="navbar-link">Top Songs</Link>
        <Link to="/top-artists" className="navbar-link">Top Artists</Link>
        <Link to="/top-albums" className="navbar-link">Top Albums</Link>
        <Link to="/search" className="navbar-link">Search Songs</Link>
        <Link to="/playlist-search" className="navbar-link">Search Playlists</Link>

      </nav>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<TopSongs />} />
        <Route path="/top-songs" element={<TopSongs />} />
        <Route path="/top-artists" element={<TopArtists />} />
        <Route path="/top-albums" element={<TopAlbums />} />
        <Route path="/search" element={<Search />} />
        <Route path="/playlist-search" element={<PlaylistSearch />} />
      </Routes>
    </div>
  </Router>
);

export default App;