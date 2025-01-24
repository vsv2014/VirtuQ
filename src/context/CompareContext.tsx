import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Product } from '../types';

interface CompareState {
  items: Product[];
  maxItems: number;
}

type CompareAction =
  | { type: 'ADD_TO_COMPARE'; payload: Product }
  | { type: 'REMOVE_FROM_COMPARE'; payload: string }
  | { type: 'CLEAR_COMPARE' };

interface CompareContextType extends CompareState {
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  canAddMore: () => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case 'ADD_TO_COMPARE':
      if (state.items.length >= state.maxItems) {
        return state;
      }
      if (state.items.some(item => item.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_FROM_COMPARE':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'CLEAR_COMPARE':
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, {
    items: [],
    maxItems: 2, // Maximum number of items that can be compared
  });

  const addToCompare = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_COMPARE', payload: product });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', payload: productId });
  }, []);

  const clearCompare = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARE' });
  }, []);

  const isInCompare = useCallback(
    (productId: string) => state.items.some(item => item.id === productId),
    [state.items]
  );

  const canAddMore = useCallback(
    () => state.items.length < state.maxItems,
    [state.items]
  );

  const value = {
    ...state,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
