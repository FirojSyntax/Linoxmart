
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPaymentNumbers } from "@/app/actions";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { PaymentNumbersTable } from "./_components/payment-numbers-table";

export default async function PaymentNumbersPage() {
  const paymentNumbers = await fetchPaymentNumbers();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">Payment Numbers</h1>
            <p className="text-muted-foreground">Manage your bKash and Nagad numbers.</p>
        </div>
        <Button asChild>
          <Link href="/admin/payment-numbers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Number
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Number List</CardTitle>
          <CardDescription>A list of all numbers available for checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentNumbersTable data={paymentNumbers} />
        </CardContent>
      </Card>
    </>
  );
}
