
import { CategoryForm } from "../_components/category-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCategoryPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Add New Category</h1>
        <Card>
            <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Fill out the form to add a new category.</CardDescription>
            </CardHeader>
            <CardContent>
                <CategoryForm />
            </CardContent>
        </Card>
    </div>
  );
}
