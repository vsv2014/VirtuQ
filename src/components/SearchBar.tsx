import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SearchBar({ isOpen, onToggle }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 rounded-full">
        <input
          type="text"
          placeholder="Search for products, brands and more"
          className="w-full bg-transparent py-2 pl-4 pr-10 focus:outline-none"
        />
        <button
          onClick={onToggle}
          className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-purple-600"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}