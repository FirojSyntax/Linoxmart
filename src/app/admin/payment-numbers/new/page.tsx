
import { PaymentMethodForm } from "../_components/payment-method-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPaymentNumberPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Add New Payment Number</h1>
        <Card>
            <CardHeader>
                <CardTitle>Number Details</CardTitle>
                <CardDescription>Fill out the form to add a new number for checkout.</CardDescription>
            </CardHeader>
            <CardContent>
                <PaymentMethodForm />
            </CardContent>
        </Card>
    </div>
  );
}
