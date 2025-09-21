
import { getCategoryBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import { CategoryForm } from "../../_components/category-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  // The id from the URL is the slug
  const { id } = await params;
  const category = await getCategoryBySlug(id);

  if (!category) {
    return notFound();
  }

  return (
     <div>
      <h1 className="text-3xl font-bold mb-6">Edit Category</h1>
      <Card>
         <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Update the category information below.</CardDescription>
        </CardHeader>
        <CardContent>
            <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
