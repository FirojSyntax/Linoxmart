
import { getCategories, getProductBySlug } from "@/lib/products";
import { ProductForm } from "../../_components/product-form";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // The id is now the product slug
  const { id } = await params;
  const product = await getProductBySlug(id);
  const categories = await getCategories();

  if (!product) {
    return notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <Card>
         <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Update the product information below.</CardDescription>
        </CardHeader>
        <CardContent>
            <ProductForm product={product} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
