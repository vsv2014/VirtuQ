import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { CompareModal } from './CompareModal';

export function CompareFloatingButton() {
  const { items } = useCompare();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Scale className="w-5 h-5" />
        <span>Compare ({items.length})</span>
      </button>

      <CompareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
