
import { getProductBySlug, getProducts, type Product } from '@/lib/products';
import { notFound } from 'next/navigation';
import { ProductDetails } from './_components/product-details';


export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    return notFound();
  }

  return <ProductDetails product={product} />;
}

export async function generateStaticParams() {
    const products = await getProducts();
    return products
        .filter(product => product.slug) // Ensure the product has a slug
        .map((product) => ({
            id: product.slug,
        }));
}
