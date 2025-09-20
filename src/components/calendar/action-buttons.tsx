import React from 'react';
import { Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionButtons() {
  return (
    <div className="flex items-center gap-3">
      {/* <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Filter className="h-5 w-5 text-gray-600" />
      </Button> */}
      <Button 
        variant="primary" 
        size="md" 
        shape="circle"
        className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}