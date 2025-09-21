
import { getProductsByCategory, getCategories, getCategoryBySlug } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { notFound } from 'next/navigation';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <div className="container py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-center mb-8">
        {category.name}
      </h1>
      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No products found in this category.</p>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map(category => ({
    slug: category.slug,
  }));
}
