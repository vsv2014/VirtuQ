import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { categoryService } from '../services/category.service';

interface CategoryListProps {
  parentId?: string;
  layout?: 'grid' | 'list';
}

export function CategoryList({ parentId, layout = 'grid' }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategories();
        setCategories(parentId ? data.filter(cat => cat.parentId === parentId) : data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [parentId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-40 mb-2"></div>
            <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return <div className="p-4">No categories found</div>;
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="group block"
          >
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                />
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50"
        >
          {category.image && (
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-500">{category.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
