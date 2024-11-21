import { ArrowRight, Clock, Truck, Home, RotateCcw } from 'lucide-react';
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent z-10" />
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <div className="relative h-full w-full">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80"
              alt="Fashion model"
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
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-light mb-6 leading-tight">
              Try First.
              <br />
              <span className="font-medium">Pay Later.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Experience luxury fashion at home. Get items delivered in 30 minutes, 
              try them for 2 hours, keep what you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn btn-primary flex items-center justify-center gap-2 group">
                Start Shopping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn btn-secondary">
                View Collections
              </button>
            </div>
          </div>

          {/* Trial Process */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-gray-200">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
              >
                <div className="mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-black/5 rounded-xl transition-all duration-300" />
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-light mb-2">₹0</div>
              <p className="text-gray-600">Upfront Payment</p>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">2hrs</div>
              <p className="text-gray-600">Trial Period</p>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">100%</div>
              <p className="text-gray-600">Secure Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quote */}
      <div className="absolute bottom-8 right-8 max-w-xs bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hidden lg:block">
        <p className="text-lg font-light italic mb-4">
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
            <p className="font-medium">Sarah Johnson</p>
            <p className="text-sm text-gray-600">Fashion Enthusiast</p>
          </div>
        </div>
      </div>
    </section>
      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Home,
                title: "Browse & Select",
                description: "Choose up to 10 items from our curated collections"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Get your selections quickly from nearby stores"
              },
              {
                icon: Clock,
                title: "2-Hour Trial",
                description: "Try everything in the comfort of your home"
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                description: "Keep what you love, return the rest for free"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <step.icon className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="featured" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Categories</h2>
            <a href="/categories" className="flex items-center text-purple-600 hover:text-purple-700">
              View All <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Summer Collection",
                image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80",
                link: "/category/summer"
              },
              {
                title: "Workwear Essentials",
                image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80",
                link: "/category/workwear"
              },
              {
                title: "Casual Comfort",
                image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80",
                link: "/category/casual"
              }
            ].map((category, index) => (
              <motion.a
                key={index}
                href={category.link}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="group relative h-96 overflow-hidden rounded-xl"
              >
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                    <span className="text-white/80 group-hover:text-white flex items-center">
                      Shop Now <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <div className="py-24 bg-[#FCFCFC]" id="brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-light mb-4">Featured Collections</h2>
            <p className="text-gray-600">Curated selection of premium fashion brands</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-black hover:gap-4 transition-all">
            View All Collections
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {brands.map((brand, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-sm mb-2">{brand.category}</div>
                  <h3 className="text-xl font-medium">{brand.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Trust Badges */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: "Free Delivery", value: "On all orders" },
              { title: "Try Before Buy", value: "2-hour trial period" },
              { title: "Easy Returns", value: "Hassle-free process" },
              { title: "Secure Payments", value: "100% safe & secure" }
            ].map((badge, index) => (
              <div key={index} className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{badge.title}</h4>
                <p className="text-gray-600">{badge.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}