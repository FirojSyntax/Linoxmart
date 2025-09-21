

"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Package, Clock, CheckCircle, ChevronRight, Ban, User as UserIcon, Calendar, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { getOrdersByUserId, type Order } from "@/lib/products";
import { format } from 'date-fns';
import { doc, getDoc, Timestamp } from "firebase/firestore";

const statusStyles: { [key: string]: string } = {
  Placed: "bg-blue-500",
  Processing: "bg-yellow-500 text-black",
  Shipped: "bg-orange-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-500",
};

interface UserInfo {
    fullName: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
}


export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    // If auth is still loading, do nothing.
    if (loading) {
      setIsFetchingData(true);
      return;
    }

    // If auth is done loading and there's no user, redirect.
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If we have a user, fetch their data.
    const loadUserData = async () => {
      setIsFetchingData(true);
      try {
        const [userOrders, userDocSnap] = await Promise.all([
             getOrdersByUserId(user.uid),
             getDoc(doc(db, "users", user.uid))
        ]);

        setOrders(userOrders);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const createdAtTimestamp = userData.createdAt as Timestamp;
            setUserInfo({
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                createdAt: format(createdAtTimestamp.toDate(), 'PPP')
            });
        }

      } catch (error) {
          console.error("Failed to fetch user data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    
    loadUserData();

  }, [user, loading, router]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isFetchingData || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    );
  }

  const getPaymentType = (order: Order) => {
    if (order.customerInfo.paymentOption === 'full_advance') return "Full Advance";
    if (order.customerInfo.paymentOption === 'cod_with_advance') return "Cash on Delivery";
    return "N/A";
  }

  const getDueAmount = (order: Order) => {
    if (order.status === 'Cancelled' || order.status === 'Delivered') return 0;
    if (order.customerInfo.paymentOption === 'full_advance') return 0;
    if (order.customerInfo.paymentOption === 'cod_with_advance') {
        const due = order.total - 120;
        return due > 0 ? due : 0;
    }
    return order.total;
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  return (
    <div className="container my-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {userInfo?.fullName || user.email}</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="mt-4 md:mt-0">
          Logout
        </Button>
      </div>

       {/* User Info Card */}
       {userInfo && (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-muted-foreground">Full Name</p>
                            <p className="font-medium">{userInfo.fullName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                         <div>
                            <p className="text-muted-foreground">Email Address</p>
                            <p className="font-medium">{userInfo.email}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                         <div>
                            <p className="text-muted-foreground">Phone Number</p>
                            <p className="font-medium">{userInfo.phoneNumber}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                         <div>
                            <p className="text-muted-foreground">Registered On</p>
                            <p className="font-medium">{userInfo.createdAt}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}


      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Check the status of your recent orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length > 0 ? orders.map((order) => (
            <div key={order.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <p className="font-semibold text-primary">Order #{order.orderId}</p>
                  <p className="text-sm text-muted-foreground">Date: {format(new Date(order.createdAt), 'PPP')}</p>
                   <div className="flex flex-wrap gap-2 mt-2">
                     <Badge className={cn("text-white", statusStyles[order.status])}>{order.status}</Badge>
                     <Badge variant="outline">{getPaymentType(order)}</Badge>
                   </div>
                </div>
                <div className="flex flex-col sm:items-end">
                    <p className="text-lg font-bold">Total: ৳{order.total.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-destructive">Due: ৳{getDueAmount(order).toFixed(2)}</p>
                </div>
                <div className="self-center ml-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/track-order">
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Track Order</span>
                        </Link>
                    </Button>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint="product image" />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Orders Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">You haven't placed any orders with us yet. Let's change that!</p>
              <Button asChild className="mt-6">
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
