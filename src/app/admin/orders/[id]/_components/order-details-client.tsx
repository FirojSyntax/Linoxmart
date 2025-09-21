
"use client";

import { handleUpdateOrderStatus } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/products";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface OrderDetailsClientProps {
  order: Order;
}

const statusOptions = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusStyles: { [key: string]: string } = {
  Placed: "bg-blue-500",
  Processing: "bg-yellow-500 text-black",
  Shipped: "bg-orange-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-500",
};

export function OrderDetailsClient({ order: initialOrder }: OrderDetailsClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await handleUpdateOrderStatus(order.id, newStatus);
    if (result.success) {
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast({ title: "Success", description: "Order status updated successfully." });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update order status.",
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const getPaymentType = (order: Order) => {
    if (order.customerInfo.paymentOption === 'full_advance') return "Full Advance";
    if (order.customerInfo.paymentOption === 'cod_with_advance') return "Cash on Delivery";
    return "N/A";
  }

  const getAmountPaid = (order: Order) => {
    if (order.customerInfo.paymentOption === 'full_advance') {
        return order.total;
    }
    if (order.customerInfo.paymentOption === 'cod_with_advance') {
        return 120;
    }
    return 0;
  }
  
  const getAmountDue = (order: Order) => {
    if (order.status === 'Cancelled' || order.status === 'Delivered') return 0;
    const due = order.total - getAmountPaid(order);
    return due > 0 ? due : 0;
  }


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.orderId}</p>
        </div>
        <div className="flex items-center gap-4">
            <Badge className={`text-lg px-4 py-2 text-white ${statusStyles[order.status] || 'bg-gray-500'}`}>
                {order.status}
            </Badge>
            <Select onValueChange={handleStatusChange} defaultValue={order.status} disabled={isUpdating}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
           {/* Items Card */}
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {order.items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md" />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">৳{item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">৳{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           {/* Customer Details Card */}
          <Card>
            <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
                <p><strong>Name:</strong> {order.customerInfo.name}</p>
                <p><strong>Phone:</strong> {order.customerInfo.phoneNumber}</p>
                <p><strong>Address:</strong> {order.customerInfo.address}</p>
                <p><strong>Order Date:</strong> {format(new Date(order.createdAt), 'PPP p')}</p>
            </CardContent>
          </Card>

           {/* Payment Details Card */}
          <Card>
            <CardHeader><CardTitle>Payment & Billing</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
                 <div className="space-y-1">
                    <p><strong>Payment Option:</strong> <span className="font-semibold capitalize">{getPaymentType(order)}</span></p>
                    <p><strong>Payment Method:</strong> <span className="font-semibold capitalize">{order.customerInfo.paymentMethod.replace(/_/g, ' ')}</span></p>
                    {order.customerInfo.transactionId && (
                        <p><strong>Transaction ID:</strong> {order.customerInfo.transactionId}</p>
                    )}
                    {order.customerInfo.senderNumber && (
                        <p><strong>Sender Number:</strong> {order.customerInfo.senderNumber}</p>
                    )}
                 </div>
                 <Separator/>
                <div className="space-y-2">
                    <p className="flex justify-between"><span>Subtotal:</span> <span>৳{order.total.toFixed(2)}</span></p>
                    <p className="flex justify-between"><span>Shipping:</span> <span>৳0.00</span></p>
                    <Separator/>
                    <p className="flex justify-between font-bold"><strong>Total:</strong> <span>৳{order.total.toFixed(2)}</span></p>
                    <p className="flex justify-between text-green-600"><strong>Paid:</strong> <span>- ৳{getAmountPaid(order).toFixed(2)}</span></p>
                    <Separator/>
                    <p className="flex justify-between font-bold text-lg text-destructive"><strong>Due:</strong> <span>৳{getAmountDue(order).toFixed(2)}</span></p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
