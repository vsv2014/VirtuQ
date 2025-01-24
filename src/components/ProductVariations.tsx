import { useState } from 'react';
import { ProductVariation } from '../types/index';

interface ProductVariationsProps {
  variations: ProductVariation[];
  onSelect: (variation: ProductVariation | null) => void;
}

export function ProductVariations({ variations, onSelect }: ProductVariationsProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Get unique options
  const sizes = [...new Set(variations.map(v => v.size))];
  const colors = [...new Set(variations.map(v => v.color))];

  // Handle selection
  const handleSelect = (type: 'size' | 'color', value: string) => {
    if (type === 'size') {
      setSelectedSize(selectedSize === value ? '' : value);
    } else {
      setSelectedColor(selectedColor === value ? '' : value);
    }

    const variation = variations.find(
      v => v.size === (type === 'size' ? value : selectedSize) && 
          v.color === (type === 'color' ? value : selectedColor)
    );
    onSelect(variation || null);
  };

  // Get available options based on current selection
  const getAvailableOptions = (type: 'size' | 'color') => {
    if (type === 'size') {
      return selectedColor
        ? variations.filter(v => v.color === selectedColor).map(v => v.size)
        : sizes;
    }
    return selectedSize
      ? variations.filter(v => v.size === selectedSize).map(v => v.color)
      : colors;
  };

  const renderOptions = (type: 'size' | 'color', options: string[]) => {
    const selected = type === 'size' ? selectedSize : selectedColor;
    const available = getAvailableOptions(type);

    return options.map(option => (
      <button
        key={option}
        onClick={() => handleSelect(type, option)}
        disabled={!available.includes(option)}
        className={`
          px-3 py-2 text-sm font-medium rounded-md
          ${selected === option ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300'}
          ${!available.includes(option) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        {option}
      </button>
    ));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Size</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {renderOptions('size', sizes)}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Color</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {renderOptions('color', colors)}
        </div>
      </div>

      {selectedSize && selectedColor && (
        <p className="text-sm text-gray-500">
          {variations.find(v => v.size === selectedSize && v.color === selectedColor)?.stock || 0} in stock
        </p>
      )}
    </div>
  );
}
