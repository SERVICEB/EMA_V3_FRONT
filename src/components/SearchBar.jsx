// src/components/SearchBar.jsx
import React from "react";

const SearchBar = () => {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg flex flex-col md:flex-row gap-4">
      <input type="text" placeholder="Ville" className="flex-1 p-2 border border-gray-300 rounded" />
      <input type="text" placeholder="Dates Arrivée-Départ" className="flex-1 p-2 border border-gray-300 rounded" />
      <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
        Rechercher
      </button>
    </div>
  );
};

export default SearchBar;
