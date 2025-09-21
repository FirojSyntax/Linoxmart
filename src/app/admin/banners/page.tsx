
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBanners } from "@/app/actions";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { BannersTable } from "./_components/banners-table";

export default async function BannersPage() {
  const banners = await fetchBanners();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">Banners</h1>
            <p className="text-muted-foreground">Manage your homepage hero banners.</p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Banner
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Banner List</CardTitle>
          <CardDescription>A list of all hero banners.</CardDescription>
        </CardHeader>
        <CardContent>
          <BannersTable data={banners} />
        </CardContent>
      </Card>
    </>
  );
}
