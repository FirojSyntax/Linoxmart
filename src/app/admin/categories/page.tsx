
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/products";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { CategoriesTable } from "./_components/categories-table";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage your product categories.</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>A list of all product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesTable data={categories} />
        </CardContent>
      </Card>
    </>
  );
}
