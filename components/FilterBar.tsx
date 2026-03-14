import React from 'react';
import { useStore } from '../context/Store';
import { Search, SlidersHorizontal } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, properties } = useStore();

  // Determine the max price from the available properties, defaulting to a high number
  const maxPriceInDb = Math.max(...properties.map(p => p.price), 1000000);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, maxPrice: parseInt(e.target.value, 10) });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-center sticky top-4 z-10">
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by address, title..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 pl-10 rounded-md bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <SlidersHorizontal className="text-slate-400" size={20} />
        <div className="flex-1">
          <label className="text-xs text-slate-400 block">Max Price</label>
          <input
            type="range"
            min="0"
            max={maxPriceInDb}
            step={10000}
            value={filters.maxPrice ?? maxPriceInDb}
            onChange={handlePriceChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <span className="text-white font-semibold w-28 text-right">
        ₹{(filters.maxPrice ?? maxPriceInDb).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
