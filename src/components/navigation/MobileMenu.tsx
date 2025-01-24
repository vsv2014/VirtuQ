import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { NavigationItem } from '@/types';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface MobileMenuProps {
  items: NavigationItem[];
  onClose: () => void;
}

interface MenuLevel {
  title: string;
  items: NavigationItem[];
}

export function MobileMenu({ items, onClose }: MobileMenuProps) {
  const [menuStack, setMenuStack] = useState<MenuLevel[]>([
    { title: 'Menu', items }
  ]);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, onClose);

  const currentLevel = menuStack[menuStack.length - 1];

  const handlePushMenu = (title: string, items: NavigationItem[]) => {
    setMenuStack([...menuStack, { title, items }]);
  };

  const handlePopMenu = () => {
    setMenuStack(menuStack.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div
        ref={menuRef}
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <div className="flex items-center">
            {menuStack.length > 1 && (
              <button
                onClick={handlePopMenu}
                className="mr-2 p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-medium">{currentLevel.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {currentLevel.items.map((item) => (
            <div key={item.id} className="border-b">
              {item.items ? (
                <button
                  onClick={() => handlePushMenu(item.label, item.items || [])}
                  className="flex items-center justify-between w-full p-4 hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  to={item.href}
                  className="block p-4 hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.label}
                  {item.isNew && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      New
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
