
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, PackageCheck, Truck, Home, Ban, Clock } from "lucide-react";
import { useState } from "react";
import { findOrder } from "../actions";
import { Order } from "@/lib/products";
import { format } from "date-fns";

const formSchema = z.object({
  trackingId: z.string().min(1, "Please enter your Order ID, Email, or Phone Number."),
});

type OrderStatus = Order | null;

const allStatuses = [
    { status: "Placed", icon: <Package className="h-5 w-5" />, description: "Your order has been placed successfully." },
    { status: "Processing", icon: <Clock className="h-5 w-5" />, description: "We are preparing your order." },
    { status: "Shipped", icon: <Truck className="h-5 w-5" />, description: "Your order has been shipped and is on its way." },
    { status: "Delivered", icon: <PackageCheck className="h-5 w-5" />, description: "Your order has been delivered." },
    { status: "Cancelled", icon: <Ban className="h-5 w-5" />, description: "Your order has been cancelled." },
];

export default function TrackOrderPage() {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setOrderStatus(null);
    
    const trackingId = values.trackingId.trim();
    const result = await findOrder(trackingId);

    if (result) {
        setOrderStatus(result);
        toast({
            title: "Order Found!",
            description: `Displaying status for Order #${result.orderId}`,
        });
    } else {
         toast({
            title: "Order Not Found",
            description: "We couldn't find an order with that information.",
            variant: "destructive",
        });
    }
    
    setIsLoading(false);
  }

  const currentStatusIndex = orderStatus ? allStatuses.findIndex(s => s.status === orderStatus.status) : -1;

  return (
    <div className="container my-12 px-4 md:px-6 max-w-2xl">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-headline">Track Your Order</CardTitle>
          <CardDescription>Enter your order details below to see its status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="trackingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID or Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g., 1700000000 or 01..." {...field} className="pr-12" />
                        <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10" disabled={isLoading}>
                          {isLoading ? 
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" /> :
                            <Search className="h-4 w-4" />
                          }
                          <span className="sr-only">Track</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {isLoading && (
             <div className="mt-8 text-center">
                <div className="flex justify-center items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                    <p className="text-muted-foreground">Searching for your order...</p>
                </div>
            </div>
          )}
          
          {orderStatus && (
            <div className="mt-8 space-y-6">
                <div className="text-center border-b pb-4">
                    <h3 className="text-lg font-semibold">Order #{orderStatus.orderId}</h3>
                    <p className="text-primary font-bold">Status: {orderStatus.status}</p>
                    <p className="text-sm text-muted-foreground">Ordered on: {format(new Date(orderStatus.createdAt), "PPP")}</p>
                </div>
                <div>
                     <h4 className="font-semibold mb-4">Tracking History</h4>
                     <div className="relative pl-6">
                        <div className="absolute left-[11px] top-0 h-full w-0.5 bg-border"></div>
                        {allStatuses.slice(0, currentStatusIndex + 1).map((event, index) => (
                           <div key={index} className="flex items-start gap-4 mb-6 last:mb-0">
                               <div className="z-10 bg-background flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary text-primary">
                                    {event.icon}
                               </div>
                                <div className="flex-1 -mt-1">
                                    <p className="font-semibold text-sm">{event.status}</p>
                                    <p className="text-xs text-muted-foreground">{event.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

