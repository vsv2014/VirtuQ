import { api } from './api';
import { NavigationItem } from '../types';
import { mockNavigation } from './mock/navigation.mock';

const isDevelopment = import.meta.env.DEV;

export const navigationService = {
  getMainNavigation: async (): Promise<NavigationItem[]> => {
    if (isDevelopment) {
      return Promise.resolve(mockNavigation);
    }
    const response = await api.get('/navigation/main');
    return response.data;
  },

  getMegaMenuContent: async (categoryId: string): Promise<NavigationItem[]> => {
    if (isDevelopment) {
      const category = mockNavigation.find(item => item.href.includes(categoryId));
      return Promise.resolve(category ? [category] : []);
    }
    const response = await api.get(`/navigation/mega-menu/${categoryId}`);
    return response.data;
  },

  getFooterNavigation: async (): Promise<{
    company: NavigationItem[];
    support: NavigationItem[];
    legal: NavigationItem[];
    social: NavigationItem[];
  }> => {
    if (isDevelopment) {
      return Promise.resolve({
        company: [
          { id: 'about', label: 'About Us', href: '/about', type: 'category' },
          { id: 'careers', label: 'Careers', href: '/careers', type: 'category' }
        ],
        support: [
          { id: 'help', label: 'Help Center', href: '/help', type: 'category' },
          { id: 'contact', label: 'Contact Us', href: '/contact', type: 'category' }
        ],
        legal: [
          { id: 'privacy', label: 'Privacy Policy', href: '/privacy', type: 'category' },
          { id: 'terms', label: 'Terms of Service', href: '/terms', type: 'category' }
        ],
        social: [
          { id: 'facebook', label: 'Facebook', href: '#', type: 'category' },
          { id: 'twitter', label: 'Twitter', href: '#', type: 'category' }
        ]
      });
    }
    const response = await api.get('/navigation/footer');
    return response.data;
  },

  getMobileNavigation: async (): Promise<NavigationItem[]> => {
    if (isDevelopment) {
      return Promise.resolve(mockNavigation);
    }
    const response = await api.get('/navigation/mobile');
    return response.data;
  },

  getUserNavigation: async (): Promise<NavigationItem[]> => {
    if (isDevelopment) {
      return Promise.resolve([
        { id: 'profile', label: 'Profile', href: '/profile', type: 'category' },
        { id: 'orders', label: 'Orders', href: '/orders', type: 'category' },
        { id: 'wishlist', label: 'Wishlist', href: '/wishlist', type: 'category' }
      ]);
    }
    const response = await api.get('/navigation/user');
    return response.data;
  }
};
