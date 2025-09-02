'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange
}: SearchAndFiltersProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
      <input 
        type="text"
        placeholder="Search exercises..." 
        className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}