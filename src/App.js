// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import TopSongs from './pages/TopSongs';
import TopArtists from './pages/TopArtists';
import TopAlbums from './pages/TopAlbums';
import Search from './pages/Search';
import PlaylistSearch from './pages/PlaylistSearch';
import './styles/App.css';

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
