import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NavigationItem } from '@/types';
import { ChevronDown } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface CategoryDropdownProps {
  items: NavigationItem[];
}

export function CategoryDropdown({ items }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const categories = items.filter(item => item.type === 'category');

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 py-2 text-gray-700 hover:text-gray-900"
      >
        <span>Categories</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
