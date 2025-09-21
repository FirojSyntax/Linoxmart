
import { BannerForm } from "../_components/banner-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewBannerPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Add New Banner</h1>
        <Card>
            <CardHeader>
                <CardTitle>Banner Details</CardTitle>
                <CardDescription>Fill out the form to add a new banner to your homepage.</CardDescription>
            </CardHeader>
            <CardContent>
                <BannerForm />
            </CardContent>
        </Card>
    </div>
  );
}
