
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/components/providers/auth-provider";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { getPaymentNumbers, type PaymentNumber } from "@/lib/products";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phoneNumber: z.string().min(11, "Please enter a valid phone number."),
  address: z.string().min(5, "Please provide a full address."),
  paymentOption: z.enum(["cod_with_advance", "full_advance"], {
    required_error: "You need to select a payment option.",
  }),
  paymentMethod: z.enum(["bkash", "nagad"], {
    required_error: "You need to select a payment method.",
  }),
  transactionId: z.string().min(1, "Transaction ID is required."),
  senderNumber: z.string().min(11, "Sender number is required."),
});


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [paymentNumbers, setPaymentNumbers] = useState<PaymentNumber[]>([]);

  useEffect(() => {
    const fetchNumbers = async () => {
      const numbers = await getPaymentNumbers();
      setPaymentNumbers(numbers);
    };
    fetchNumbers();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
    },
  });

  const paymentOption = form.watch("paymentOption");
  const paymentMethod = form.watch("paymentMethod");

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Payment number copied to clipboard." });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const orderData = {
            orderId: Date.now().toString(),
            userId: user ? user.uid : null,
            customerInfo: values,
            items: cartItems,
            total: cartTotal,
            status: "Placed", 
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "orders"), orderData);

        toast({
            title: "Order Placed!",
            description: "Thank you for your purchase. Your order is being processed.",
        });
        clearCart();
        router.push("/account");
    } catch (error) {
         console.error("Error placing order: ", error);
         toast({
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
            variant: "destructive",
        });
    }
  }

  if (cartItems.length === 0) {
    return (
       <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl font-bold font-headline mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground">You can't checkout with an empty cart.</p>
      </div>
    )
  }
  
  const amountToPay = paymentOption === 'full_advance' ? cartTotal : 120;
  const filteredNumbers = paymentNumbers.filter(n => n.type === paymentMethod);

  return (
    <div className="container my-12 px-4 md:px-6">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Your Phone Number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input placeholder="Your Full Address" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="paymentOption"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Payment Option</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="cod_with_advance" /></FormControl><FormLabel className="font-normal">Cash on Delivery (120tk Advance)</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="full_advance" /></FormControl><FormLabel className="font-normal">Full Advance Payment</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {paymentOption && (
                  <div className="mt-4 pt-4 border-t">
                     <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3 mb-4">
                          <FormLabel>Pay With</FormLabel>
                          <FormControl>
                             <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                               <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="bkash" /></FormControl><FormLabel className="font-normal">bKash</FormLabel></FormItem>
                               <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="nagad" /></FormControl><FormLabel className="font-normal">Nagad</FormLabel></FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentMethod && (
                    <div className="mt-4 space-y-4 pt-4 border-t">
                      <Alert>
                        <AlertTitle>Payment Instructions</AlertTitle>
                        <AlertDescription>
                          Please send ৳{amountToPay.toFixed(2)} to one of the numbers below and provide the details.
                        </AlertDescription>
                      </Alert>

                      {filteredNumbers.length > 0 ? (
                        <div className="space-y-2">
                          {filteredNumbers.map(num => (
                            <div key={num.id} className="flex items-center justify-between p-2 border rounded-md">
                              <div>
                                <span className="font-semibold">{num.number}</span>
                                <span className="text-xs text-muted-foreground ml-2">({num.accountType})</span>
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleCopyToClipboard(num.number)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-red-500">No {paymentMethod} number available.</p>}
                      
                        <FormField control={form.control} name="transactionId" render={({ field }) => (
                            <FormItem><FormLabel>Transaction ID</FormLabel><FormControl><Input placeholder="e.g. 8N7F6G5H4J" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="senderNumber" render={({ field }) => (
                            <FormItem><FormLabel>Sender Phone Number</FormLabel><FormControl><Input placeholder="The number you paid from" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        </Form>
        
        <div>
          <Card className="sticky top-24">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint="product image" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                 <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳{cartTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>৳{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
