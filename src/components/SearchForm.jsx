import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi'; // Icône de loupe
import './SearchForm.css';

export default function SearchForm() {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const toggleForm = () => setVisible(!visible);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Recherche:', query);
  };

  return (
    <div className="search-container">
      <button className="search-icon" onClick={toggleForm}>
        <FiSearch size={22} />
      </button>

      {visible && (
        <form className="search-form chic" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Rechercher une ville ou une résidence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">OK</button>
        </form>
      )}
    </div>
  );
}
