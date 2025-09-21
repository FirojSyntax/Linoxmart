
"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import { fetchRecommendations } from "@/app/actions";
import { ProductCard } from "./product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "./providers/auth-provider";
import { getOrdersByUserId } from "@/lib/products";

export function PersonalizedRecommendations() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getRecommendations() {
      if (authLoading) return;
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userOrders = await getOrdersByUserId(user.uid);
        const purchaseHistory = userOrders.flatMap(order => order.items.map(item => item.id));
        const uniquePurchaseHistory = [...new Set(purchaseHistory)];

        if (uniquePurchaseHistory.length === 0) {
          setIsLoading(false);
          return;
        }

        const recommendationInput = {
          userId: user.uid,
          purchaseHistory: uniquePurchaseHistory,
        };
        const products = await fetchRecommendations(recommendationInput);
        setRecommendations(products);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getRecommendations();
  }, [user, authLoading]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-center">
            Just For You
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (recommendations.length === 0 || !user) {
    return null; // Don't show the section if there are no recommendations or user is not logged in
  }

  return (
    <section className="bg-muted/30 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-center mb-8">
          Just For You
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: recommendations.length > 4,
          }}
          className="w-full"
        >
          <CarouselContent>
            {recommendations.map((product) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                <div className="p-1">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12 hidden lg:inline-flex" />
          <CarouselNext className="mr-12 hidden lg:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
