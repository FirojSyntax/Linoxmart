
import { searchProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { PackageSearch } from 'lucide-react';

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;

  if (!query) {
    return (
        <div className="container py-12 px-4 md:px-6 text-center">
             <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Search for products</h1>
                <p className="text-muted-foreground">Please enter a search term in the search bar above to find products.</p>
            </div>
        </div>
    )
  }

  const products = await searchProducts(query);

  return (
    <div className="container py-12 px-4 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline mb-8">
        Search results for: <span className="text-primary">&quot;{query}&quot;</span>
      </h1>
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <PackageSearch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold">No products found</p>
            <p className="text-muted-foreground mt-2">We couldn&apos;t find any products matching your search for &quot;{query}&quot;.</p>
        </div>
      )}
    </div>
  );
}
