import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { TagFilter } from './components/TagFilter';

interface WorkoutSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAllTags: () => void;
  showTagFilters: boolean;
  onToggleTagFilters: () => void;
}

export function WorkoutSearchFilters({
  searchTerm,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClearAllTags,
  showTagFilters,
  onToggleTagFilters
}: WorkoutSearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <SearchBar value={searchTerm} onChange={onSearchChange} />
        <Button 
          variant="outline"
          onClick={onToggleTagFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {showTagFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      <TagFilter
        tags={allTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        onClearAll={onClearAllTags}
        isVisible={showTagFilters}
      />
    </div>
  );
}