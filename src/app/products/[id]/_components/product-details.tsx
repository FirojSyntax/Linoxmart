

"use client";

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Star, Plus, Minus, ShoppingCart, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

function ProductRating({ rating, reviewsCount }: { rating: number; reviewsCount: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-accent text-accent" />
        ))}
        {halfStar && <Star key="half" className="h-5 w-5 fill-accent text-accent" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-accent" />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({reviewsCount} reviews)</span>
    </div>
  );
}

function CustomerReviews({ product }: { product: Product }) {
  // Ensure reviews is always an array to prevent .map() error.
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  if (reviews.length === 0) {
    return (
        <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold">No Reviews Yet</h3>
            <p className="text-muted-foreground">Be the first to share your thoughts on this product!</p>
        </div>
    );
  }

  return (
    <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" /> Customer Reviews
        </h3>
        <div className="space-y-6">
            {reviews.map((review, index) => (
            <div key={index} className="flex gap-4">
                <Avatar>
                    <AvatarFallback>{review.author ? review.author.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{review.author}</h4>
                         <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                </div>
            </div>
            ))}
        </div>
    </div>
  )
}


export function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="container mx-auto max-w-5xl my-12 px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={800}
            className="rounded-lg object-cover w-full h-full shadow-lg"
            data-ai-hint="product detail"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
          <div className="my-4">
            <ProductRating rating={product.rating} reviewsCount={product.reviews?.length || 0} />
          </div>
          <p className="text-3xl font-bold text-primary mb-4">৳{product.price.toFixed(2)}</p>
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
          <Separator className="my-6" />
          <div className="flex items-center gap-4 mb-6">
            <p className="font-semibold">Quantity:</p>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
        </div>
      </div>
      <Separator className="my-12" />
      <CustomerReviews product={product} />
    </div>
  );
}
