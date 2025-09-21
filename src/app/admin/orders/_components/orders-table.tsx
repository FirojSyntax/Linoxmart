
"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from 'date-fns';

interface OrdersTableProps {
  data: Order[];
}

const statusStyles: { [key: string]: string } = {
  Placed: "bg-blue-500",
  Processing: "bg-yellow-500",
  Shipped: "bg-orange-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-500",
};


export function OrdersTable({ data }: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-primary">
              <Link href={`/admin/orders/${order.id}`}>
                #{order.orderId}
              </Link>
            </TableCell>
            <TableCell>{order.customerInfo.name}</TableCell>
            <TableCell>
              {format(new Date(order.createdAt), 'PPP')}
            </TableCell>
            <TableCell>
              <Badge className={`text-white ${statusStyles[order.status] || 'bg-gray-500'}`}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/admin/orders/${order.id}`}>
                  View <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
