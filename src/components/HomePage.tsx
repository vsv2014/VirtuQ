import { ArrowRight, Clock, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Package, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Package,
    title: "Browse & Order",
    description: "Select up to 10 clothes from curated collections"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Get items delivered in 30 minutes"
  },
  {
    icon: Clock,
    title: "2-Hour Trial",
    description: "Try everything in your comfort zone"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Keep what you love, return the rest"
  }
];

const brands = [
  {
    name: "Luxury Collection",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80",
    category: "Premium"
  },
  {
    name: "Street Style",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80",
    category: "Trending"
  },
  {
    name: "Designer Wear",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80",
    category: "Exclusive"
  },
  {
    name: "Casual Edit",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80",
    category: "Essentials"
  }
];

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] pt-32 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 z-10" />
          <div className="absolute right-0 top-0 w-1/2 h-full">
            <div className="relative h-full w-full">
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80"
                alt="Elegant fashion display"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-6xl md:text-7.5xl font-light mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
                Try First.
                <br />
                <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-sky-400">
                  Pay Later.
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Experience luxury fashion at home. Get items delivered in 30 minutes, 
                try them for 2 hours, keep what you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary shadow-glow flex items-center justify-center gap-2 group"
                >
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary"
                >
                  View Collections
                </motion.button>
              </div>
            </motion.div>

            {/* Trial Process */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group cursor-pointer"
                >
                  <div className="mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                    <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/10 rounded-xl transition-all duration-300" />
                </motion.div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-3xl font-light mb-2 text-gray-900 dark:text-white">₹0</div>
                <p className="text-gray-600 dark:text-gray-400">Upfront Payment</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-3xl font-light mb-2 text-gray-900 dark:text-white">2hrs</div>
                <p className="text-gray-600 dark:text-gray-400">Trial Period</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-3xl font-light mb-2 text-gray-900 dark:text-white">100%</div>
                <p className="text-gray-600 dark:text-gray-400">Secure Returns</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Quote */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 right-8 max-w-xs bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-soft hidden lg:block"
        >
          <p className="text-lg font-light italic mb-4 text-gray-900 dark:text-white">
            "Try before you buy - the future of fashion shopping is here!"
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80" 
                alt="Customer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fashion Enthusiast</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="text-4xl font-light mb-4 text-gray-900 dark:text-white">Featured Collections</h2>
              <p className="text-gray-600 dark:text-gray-400">Curated selection of premium fashion brands</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:gap-4 transition-all">
              View All Collections
              <ArrowRight size={20} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brands.map((brand, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent group-hover:from-black/70 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform group-hover:-translate-y-1 transition-transform">
                    <div className="text-sm mb-2 text-white/80">{brand.category}</div>
                    <h3 className="text-xl font-medium">{brand.name}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: "Free Delivery", value: "On all orders" },
              { title: "Try Before Buy", value: "2-hour trial period" },
              { title: "Easy Returns", value: "Hassle-free process" },
              { title: "Secure Payments", value: "100% safe & secure" }
            ].map((badge, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{badge.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">{badge.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}