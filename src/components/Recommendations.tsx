import { useRecommendations } from '../hooks/useRecommendations';
import { RecommendationsSection } from './RecommendationsSection';
import { Loader2 } from 'lucide-react';

interface RecommendationsProps {
  productId?: string;
  className?: string;
}

export function Recommendations({ productId, className = '' }: RecommendationsProps) {
  const { recommendations, isLoading, error } = useRecommendations(productId);

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {recommendations.map((recommendation) => (
        <RecommendationsSection
          key={recommendation.type}
          recommendation={recommendation}
        />
      ))}
    </div>
  );
}
