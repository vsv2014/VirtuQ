import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { categories } from '../data/mockProducts';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

/**
 * Desktop category navigation.
 *
 * Fixes over the previous version:
 *  - the merchandising tree comes from the shared catalog instead of a
 *    duplicated inline copy (and a dead `data/categories.ts`),
 *  - item links match the real `/category/:category/:subcategory` route,
 *  - menus open on click/keyboard as well as hover, with aria attributes.
 */
export function Navigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const ref = useOnClickOutside<HTMLElement>(() => {
    setActiveMenu(null);
    setActiveGroup(null);
  }, activeMenu !== null);

  return (
    <nav ref={ref} className="hidden items-center space-x-6 md:flex" aria-label="Main">
      {categories.map((category) => {
        const open = activeMenu === category.slug;

        return (
          <div key={category.slug} className="relative">
            <button
              type="button"
              className="flex items-center gap-1 py-2 text-gray-700 hover:text-purple-600"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => {
                setActiveMenu(open ? null : category.slug);
                setActiveGroup(null);
              }}
              onMouseEnter={() => setActiveMenu(category.slug)}
            >
              {category.label}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open ? (
              <div
                className="absolute left-0 top-full w-72 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5"
                onMouseLeave={() => setActiveGroup(null)}
              >
                {category.groups.map((group) => (
                  <div key={group.slug} className="relative">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-2 text-left font-medium text-gray-700 hover:bg-gray-50"
                      aria-expanded={activeGroup === group.slug}
                      onClick={() =>
                        setActiveGroup(activeGroup === group.slug ? null : group.slug)
                      }
                      onMouseEnter={() => setActiveGroup(group.slug)}
                    >
                      {group.title}
                      <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
                    </button>

                    {activeGroup === group.slug ? (
                      <div className="w-full pb-1 pl-6">
                        {group.items.map((item) => (
                          <Link
                            key={item.slug}
                            to={`/category/${category.slug}/${item.slug}`}
                            onClick={() => {
                              setActiveMenu(null);
                              setActiveGroup(null);
                            }}
                            className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                          >
                            {item.label}
                            <span className="ml-1 text-xs text-gray-400">
                              ({item.count})
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}

                <Link
                  to={category.href}
                  onClick={() => {
                    setActiveMenu(null);
                    setActiveGroup(null);
                  }}
                  className="mt-1 block border-t px-4 py-2 text-sm font-medium text-purple-600 hover:bg-gray-50"
                >
                  Shop all {category.label}
                </Link>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
