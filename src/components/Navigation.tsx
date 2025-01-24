import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface Subcategory {
  title: string;
  items: string[];
}

const mens: Subcategory[] = [
  { title: 'Top Wear', items: ['Shirts & Shackets', 'T-Shirts', 'Jackets', 'Polos', 'Hoodies & Sweatshirts'] },
  { title: 'Bottom Wear', items: ['Pants & Trousers', 'Shorts', 'Cargos & Parachutes', 'Jeans', 'Joggers'] },
  { title: 'Athleisure', items: ['Track Pants', 'Shorts', 'T-Shirts', 'Tanks'] },
];

const womens: Subcategory[] = [
  { title: 'Top Wear', items: ['T-Shirts', 'Tops', 'Shirts', 'Bustiers & Corsets', 'Blazers'] },
  { title: 'Bottom Wear', items: ['Jeans', 'Skirts', 'Shorts', 'Pants & Trousers', 'Joggers'] },
  { title: 'Dresses', items: ['Bodycon', 'Midi', 'Mini', 'Maxi'] },
];

const categories = [
  { label: 'Men', href: '/category/men', subcategories: mens },
  { label: 'Women', href: '/category/women', subcategories: womens },
];

export function Navigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <nav className="hidden md:flex items-center space-x-8" role="navigation">
      <ul className="flex space-x-8">
        {categories.map((category) => (
          <li key={category.label} className="relative group" 
              onMouseEnter={() => setActiveMenu(category.label)}
              onMouseLeave={() => {
                setActiveMenu(null);
                setActiveSubmenu(null);
              }}
              tabIndex={0} // Allow keyboard navigation
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setActiveMenu(category.label);
                }
              }}
          >
            {/* Top-Level Category */}
            <Link
              to={category.href}
              className="flex items-center space-x-1 py-2 text-gray-700 hover:text-purple-600"
              aria-haspopup="true"
              aria-expanded={activeMenu === category.label ? "true" : "false"}
            >
              <span>{category.label}</span>
              <ChevronDown className="w-4 h-4" />
            </Link>

            {/* Subcategories Dropdown */}
            {activeMenu === category.label && (
              <div className="absolute top-full left-0 w-72 bg-white shadow-lg rounded-lg py-2 z-50" role="menu">
                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.title}
                    className="group/submenu relative"
                    onMouseEnter={() => setActiveSubmenu(subcategory.title)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    {/* Subcategory Title */}
                    <div 
                      className="px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium cursor-default" 
                      role="menuitem" 
                      tabIndex={0} // Allow keyboard navigation
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setActiveSubmenu(subcategory.title);
                        }
                      }}
                    >
                      {subcategory.title}
                    </div>

                    {/* Items Dropdown */}
                    {activeSubmenu === subcategory.title && (
                      <div className="absolute left-full top-0 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                        {subcategory.items.map((item) => (
                          <Link
                            key={item}
                            to={`/category/${category.label.toLowerCase()}/${subcategory.title
                              .toLowerCase()
                              .replace(/\s+/g, '-')}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-purple-600"
                            role="menuitem"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}