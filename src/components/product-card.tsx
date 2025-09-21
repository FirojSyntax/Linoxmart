

"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Eye, Zap } from "lucide-react";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    router.push('/checkout');
  }
  
  const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  // Generate a random gradient color for each product
  const gradientColors = [
    'from-pink-500 to-rose-500',
    'from-blue-500 to-cyan-500', 
    'from-purple-500 to-violet-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-teal-500 to-green-500'
  ];
  const cardGradient = gradientColors[product.id.length % gradientColors.length];

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col text-sm bg-white dark:bg-slate-800 border-0 hover:-translate-y-2 rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block flex flex-col h-full">
        <div className="relative overflow-hidden">
          <div className="aspect-square overflow-hidden rounded-t-2xl">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="aspect-square object-cover w-full transition-transform duration-700 group-hover:scale-110"
              data-ai-hint="product image"
            />
          </div>
          
          {/* Colorful gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
          
          {/* Premium overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Discount badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10">
              <Zap className="w-2 h-2 mr-1" />
              {discountPercentage}% OFF
            </Badge>
          )}
          
          {/* Hot deal badge */}
          {product.isHotDeal && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10">
              🔥 HOT
            </Badge>
          )}
          
          {/* Quick action buttons */}
          <div className="absolute top-12 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full bg-white/90 hover:bg-white shadow-lg">
              <Heart className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full bg-white/90 hover:bg-white shadow-lg">
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-semibold leading-tight h-12 overflow-hidden text-sm mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-lg font-bold text-slate-900 dark:text-white">৳{product.price.toFixed(0)}</p>
              {product.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">৳{product.originalPrice.toFixed(0)}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.soldCount})</span>
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">In Stock</span>
            </div>
          </div>
        </CardContent>
      </Link>
      
      {/* Premium action buttons */}
      <div className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-xs px-2"
            onClick={handleBuyNow}
          >
            <Zap className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Buy Now</span>
            <span className="sm:hidden">Buy</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className={`rounded-xl bg-gradient-to-r ${cardGradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs px-2`}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none rounded-2xl"></div>
    </Card>
  );
}
