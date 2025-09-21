
import { getPaymentNumberById } from "@/lib/products";
import { notFound } from "next/navigation";
import { PaymentMethodForm } from "../../_components/payment-method-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default async function EditPaymentNumberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paymentNumber = await getPaymentNumberById(id);

  if (!paymentNumber) {
    return notFound();
  }

  return (
     <div>
      <h1 className="text-3xl font-bold mb-6">Edit Payment Number</h1>
      <Card>
         <CardHeader>
            <CardTitle>Number Details</CardTitle>
            <CardDescription>Update the payment number information below.</CardDescription>
        </CardHeader>
        <CardContent>
            <PaymentMethodForm paymentNumber={paymentNumber} />
        </CardContent>
      </Card>
    </div>
  );
}
