import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MegaMenu } from './MegaMenu';
import { SearchBar } from './SearchBar';
import { MobileMenu } from './MobileMenu';
import { ChevronDown, User, ShoppingCart, Bell, Menu } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { navigationService } from '@/services/navigation.service';
import { NavigationItem } from '../../types/navigation';

export function Navigation() {
  const scrollPosition = useScrollPosition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [megaMenuItems, setMegaMenuItems] = useState<Record<string, NavigationItem[]>>({});

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const data = await navigationService.getMainNavigation();
        const mappedData = data.map(item => ({
          ...item,
          title: item.label,
          url: item.href
        }));
        setNavigationItems(mappedData);
      } catch (error) {
        console.error('Failed to fetch navigation:', error);
      }
    };

    fetchNavigation();
  }, []);

  const handleCategoryHover = async (categoryId: string) => {
    setActiveCategory(categoryId);
    
    if (!megaMenuItems[categoryId]) {
      try {
        const megaMenuData = await navigationService.getMegaMenuContent(categoryId);
        const mappedMegaMenuData = megaMenuData.map(item => ({
          ...item,
          title: item.label,
          url: item.href
        }));
        setMegaMenuItems(prev => ({
          ...prev,
          [categoryId]: mappedMegaMenuData
        }));
      } catch (error) {
        console.error('Failed to fetch mega menu content:', error);
      }
    }
  };

  const mainNavItems = navigationItems.filter(
    item => item.type === 'category' && !item.featured
  );

  // const featuredItems = navigationItems.filter(
  //   item => item.featured
  // );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrollPosition > 0 ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-sky-600">
            QTbolt
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {mainNavItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(item.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button className="flex items-center space-x-1 py-2">
                  <span>{item.title}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeCategory === item.id && megaMenuItems[item.id] && (
                  <MegaMenu
                    items={megaMenuItems[item.id]}
                    onClose={() => setActiveCategory(null)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/account" className="p-2 hover:bg-gray-100 rounded-lg">
              <User className="w-6 h-6" />
            </Link>
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        items={navigationItems}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
}
