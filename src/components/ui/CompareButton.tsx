import React from 'react';
import { Scale } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { Product } from '../../types';
import { cn } from '../../lib/utils';

interface CompareButtonProps {
  product: Product;
  className?: string;
}

export function CompareButton({ product, className }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const isCompared = isInCompare(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCompared) {
      removeFromCompare(product.id);
    } else if (canAddMore()) {
      addToCompare(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'p-2 bg-white rounded-full shadow-sm transition-colors',
        isCompared ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-50',
        !isCompared && !canAddMore() && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
      disabled={!isCompared && !canAddMore()}
    >
      <Scale className="w-5 h-5" />
    </button>
  );
}
