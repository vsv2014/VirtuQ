import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

import { useToast } from '../context/useToast';

const HELP_LINKS = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Track Order', to: '/orders' },
  { label: 'Returns', to: '/returns' },
];

const COMPANY_LINKS = [
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Return & Refund Policy', to: '/refund-policy' },
  { label: 'We Respect Your Privacy', to: '/privacy' },
  { label: 'How to Return?', to: '/how-to-return' },
];

const SHOP_LINKS = [
  { label: 'Men', to: '/category/men' },
  { label: 'Women', to: '/category/women' },
];

const SOCIALS = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
  { label: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
];

export function Footer() {
  const { show } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    show('Thanks for subscribing!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Get the TryNStyle App</h3>
            <div className="space-y-3">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-10"
                />
              </a>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  className="h-10"
                />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Help</h3>
            <ul className="space-y-2">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Shop By</h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mb-4 mt-6 text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Stay Updated</h3>
            <form className="space-y-4" onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-email" className="sr-only">
                Enter your email
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded bg-purple-600 py-2 text-white hover:bg-purple-700"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 flex space-x-4">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-white"
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} TryNStyle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
