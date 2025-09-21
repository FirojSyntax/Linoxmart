
import { fetchOrders } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersTable } from "./_components/orders-table";

export default async function AdminOrdersPage() {
  const orders = await fetchOrders();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage all customer orders.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>A list of all recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable data={orders} />
        </CardContent>
      </Card>
    </>
  );
}
