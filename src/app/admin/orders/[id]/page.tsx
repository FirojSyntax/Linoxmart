
import { fetchOrderById } from "@/app/actions";
import { notFound } from "next/navigation";
import { OrderDetailsClient } from "./_components/order-details-client";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await fetchOrderById(id);

  if (!order) {
    return notFound();
  }

  return <OrderDetailsClient order={order} />;
}
