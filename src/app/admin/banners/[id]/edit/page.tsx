
import { fetchBannerById } from "@/app/actions";
import { notFound } from "next/navigation";
import { BannerForm } from "../../_components/banner-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await fetchBannerById(id);

  if (!banner) {
    return notFound();
  }

  return (
     <div>
      <h1 className="text-3xl font-bold mb-6">Edit Banner</h1>
      <Card>
         <CardHeader>
            <CardTitle>Banner Details</CardTitle>
            <CardDescription>Update the banner information below.</CardDescription>
        </CardHeader>
        <CardContent>
            <BannerForm banner={banner} />
        </CardContent>
      </Card>
    </div>
  );
}
