import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Category } from '../types';
import { categoryService } from '../services/category.service';
// import { ProductGrid } from '../components/ProductGrid';
// import { Breadcrumb } from '../components/Breadcrumb';
import { CategoryList } from '../components/CategoryList';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) {
        setCategoryData(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await categoryService.getCategoryBySlug(slug);
        if (!data) {
          setCategoryData(null);
          setError('Category not found');
          return;
        }
        setCategoryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  if (loading) {
    return <div>Loading category...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!categoryData) {
    return <div>Category not found</div>;
  }

  // const breadcrumbItems = [
  //   { label: 'Home', href: '/' },
  //   { label: categoryData.name, href: `/category/${categoryData.slug}` }
  // ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <Breadcrumb items={breadcrumbItems} /> */}

      <div className="mt-8">
        <h1 className="text-3xl font-bold text-gray-900">{categoryData.name}</h1>
        {categoryData.description && (
          <p className="mt-2 text-gray-600">{categoryData.description}</p>
        )}
      </div>

      {/* Show subcategories if they exist */}
      {categoryData.children && categoryData.children.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
          <CategoryList parentId={categoryData.id} />
        </div>
      )}

      {/* Show products */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        {/* <ProductGrid categoryId={categoryData.id} /> */}
      </div>
    </div>
  );
}
