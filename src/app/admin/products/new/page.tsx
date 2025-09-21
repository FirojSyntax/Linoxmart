
import { getCategories } from "@/lib/products";
import { ProductForm } from "../_components/product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
        <Card>
            <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Fill out the form to add a new product to your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductForm categories={categories} />
            </CardContent>
        </Card>
    </div>
  );
}
