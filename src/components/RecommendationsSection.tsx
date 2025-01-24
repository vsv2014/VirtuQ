import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationType } from '../hooks/useRecommendations';

interface RecommendationsSectionProps {
  recommendation: RecommendationType;
}

export function RecommendationsSection({ recommendation }: RecommendationsSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(
          container.scrollWidth - container.clientWidth,
          scrollPosition + scrollAmount
        );

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative py-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {recommendation.title}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-1 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            disabled={scrollPosition === 0}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            disabled={
              scrollContainerRef.current
                ? scrollPosition >= scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
                : false
            }
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4"
      >
        {recommendation.products.map((product, index) => (
          <div key={product.id} className="flex-shrink-0 w-48 sm:w-56">
            <RecommendationCard product={product} index={index} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
