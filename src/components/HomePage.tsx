import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Truck, Home, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Boxes, RefreshCw } from 'lucide-react';

interface FeaturedLink {
  title: string;
  image: string;
  to: string;
}

interface Collection {
  name: string;
  image: string;
  category: string;
  to: string;
}

const features = [
  {
    icon: Boxes,
    title: 'Try in VR',
    description: 'See each piece on a body built from your measurements',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get items delivered in 30 minutes',
  },
  {
    icon: Clock,
    title: '2-Hour Trial',
    description: 'Try everything in your comfort zone',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: 'Keep what you love, return the rest',
  },
];

// Every card now points at a route that exists.
const featured: FeaturedLink[] = [
  {
    title: 'T-Shirts',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80',
    to: '/category/men/t-shirts',
  },
  {
    title: 'Dresses',
    image:
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80',
    to: '/category/women/dresses',
  },
  {
    title: 'Jackets',
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80',
    to: '/category/men/jackets',
  },
];

const collections: Collection[] = [
  {
    name: 'Luxury Collection',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80',
    category: 'Premium',
    to: '/category/women/blazers',
  },
  {
    name: 'Street Style',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80',
    category: 'Trending',
    to: '/category/men/hoodies-and-sweatshirts',
  },
  {
    name: 'Designer Wear',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80',
    category: 'Exclusive',
    to: '/category/women/shirts',
  },
  {
    name: 'Casual Edit',
    image:
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80',
    category: 'Essentials',
    to: '/category/men/jeans',
  },
];

const trustBadges = [
  { title: 'Free Delivery', value: 'On all orders' },
  { title: 'Try Before Buy', value: '2-hour trial period' },
  { title: 'Easy Returns', value: 'Hassle-free process' },
  { title: 'Secure Payments', value: '100% safe & secure' },
];

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-16 md:pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white to-transparent" />
          <div className="absolute right-0 top-0 h-full w-1/2">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80"
              alt="Fashion model"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-10">
              <h1 className="mb-6 text-5xl font-light leading-tight md:text-6xl">
                Try First.
                <br />
                <span className="font-medium">Pay Later.</span>
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                See it on you in 3D or VR before you commit. Get items delivered in 30
                minutes, try them for 2 hours, keep what you love.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/try-on" className="btn btn-primary">
                  Try it in VR
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/category/women" className="btn btn-secondary">
                  View Collections
                </Link>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 border-t border-gray-200 pt-8 md:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title}>
                  <feature.icon className="mb-4 h-8 w-8 text-black" />
                  <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="mb-2 text-3xl font-light">3D</div>
                <p className="text-gray-600">Virtual Fitting Room</p>
              </div>
              <div>
                <div className="mb-2 text-3xl font-light">2hrs</div>
                <p className="text-gray-600">Trial Period</p>
              </div>
              <div>
                <div className="mb-2 text-3xl font-light">100%</div>
                <p className="text-gray-600">Secure Returns</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden max-w-xs rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur-sm lg:block">
          <p className="mb-4 text-lg font-light italic">
            “Try before you buy - the future of fashion shopping is here!”
          </p>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80"
                alt="Customer"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">Sarah Johnson</p>
              <p className="text-sm text-gray-600">Fashion Enthusiast</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-4xl font-bold">How It Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Home,
                title: 'Browse & Select',
                description: 'Choose up to 10 items from our curated collections',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: 'Get your selections quickly from nearby stores',
              },
              {
                icon: Clock,
                title: '2-Hour Trial',
                description: 'Try everything in the comfort of your home',
              },
              {
                icon: RotateCcw,
                title: 'Easy Returns',
                description: 'Keep what you love, return the rest for free',
              },
            ].map((step) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <step.icon className="mb-4 h-12 w-12 text-purple-600" />
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section id="featured" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-4xl font-bold">Featured Categories</h2>
            <Link
              to="/category/women"
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              View All <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((category) => (
              <motion.div
                key={category.to}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group relative h-96 overflow-hidden rounded-xl"
              >
                <Link to={category.to} className="block h-full w-full">
                  <img
                    src={category.image}
                    alt={category.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-8">
                    <div>
                      <h3 className="mb-2 text-2xl font-bold text-white">
                        {category.title}
                      </h3>
                      <span className="flex items-center text-white/80 group-hover:text-white">
                        Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <div className="bg-[#FCFCFC] py-24" id="brands">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 text-4xl font-light">Featured Collections</h2>
              <p className="text-gray-600">
                Curated selection of premium fashion brands
              </p>
            </div>
            <Link
              to="/category/men"
              className="hidden items-center gap-2 text-black transition-all hover:gap-4 md:flex"
            >
              View All Collections
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {collections.map((brand) => (
              <Link
                key={brand.name}
                to={brand.to}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="mb-2 text-sm">{brand.category}</div>
                    <h3 className="text-xl font-medium">{brand.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="text-center">
                <h4 className="mb-2 text-xl font-bold text-gray-900">{badge.title}</h4>
                <p className="text-gray-600">{badge.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
