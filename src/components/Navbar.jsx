import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import MultiSelectDropdown from './MultiSelectDropdown';

function Navbar({ user, activeCategory, filterDate, setFilterDate, filterLocations, setFilterLocations, filterTags, setFilterTags, searchQuery, setSearchQuery, availableTags }) {
  const [searchInput, setSearchInput] = useState('');
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isAuthPage = location.pathname === '/auth';

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  const categories = ['All', 'career', 'club', 'performance', 'sports', 'wellness']; // Hardcoded sorted
  const availableLocations = [
    'University Center',
    'Hunt Library',
    'Purnell',
    'CFA',
    'Wean',
    'Gates',
    'Tepper',
    'The Cut',
    'Baker-Porter',
    'Posner',
    'Scaife',
    'Online',
    'Off-Campus',
    'Other',
  ];

  return (
    <header>
      <div className="top-bar">
        <h1><Link to="/">CMU Bulletin</Link></h1>
        <div>
          {user ? (
            <>
              <Link to="/post" className="btn" style={{ marginRight: '10px' }}>Post</Link>
              <Link to="/profile" className="btn">Profile</Link>
            </>
          ) : (
            <Link to="/auth" className="btn">Sign In</Link>
          )}
        </div>
      </div>

      {!isProfilePage && !isAuthPage && (
        <div className="category-bar">
          {categories.map(cat => (
            <Link 
              key={cat} 
              to={cat === 'All' ? '/' : `/${cat}`}
              className={activeCategory === cat ? 'active' : ''}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Link>
          ))}
        </div>
      )}

      {!isProfilePage && !isAuthPage && (
        <div className="filter-bar">
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <MultiSelectDropdown
            label="Location"
            options={availableLocations}
            selectedOptions={filterLocations}
            onChange={setFilterLocations}
          />
          <MultiSelectDropdown
            label="Tags"
            options={availableTags}
            selectedOptions={filterTags}
            onChange={setFilterTags}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
      )}
    </header>
  );
}

export default Navbar;