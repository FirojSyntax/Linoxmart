
"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X, ChevronRight, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getCategories, Product } from "@/lib/products";
import { useAuth } from "../providers/auth-provider";
import { AuthModal } from "../auth/auth-modal";
import { useRouter } from "next/navigation";
import { searchProducts } from "@/app/actions";
import { useDebounce } from "@/hooks/use-debounce";

function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length > 1) {
      setIsLoading(true);
      const searchResults = await searchProducts(searchQuery);
      setResults(searchResults);
      setIsLoading(false);
    } else {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };

  const handleResultClick = () => {
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleFormSubmit} className="relative">
        <Input 
          type="search" 
          placeholder="প্রোডাক্ট খোঁজ করুন..." 
          className="h-10 w-full pr-10" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {isFocused && (query.length > 1) && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map(product => (
                <Link key={product.id} href={`/products/${product.slug}`} onClick={handleResultClick}>
                  <div className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer">
                    <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-sm font-semibold text-primary">৳{product.price.toFixed(0)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             !isLoading && debouncedQuery && <p className="p-4 text-sm text-center text-muted-foreground">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}


function CartSheet() {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateCartItemQuantity } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
              {cartCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartCount > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md object-cover" data-ai-hint="product image" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                    <p className="text-muted-foreground text-sm">৳{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 shrink-0" onClick={() => removeFromCart(item.id)}>
                    <span className="sr-only">Remove item</span>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <SheetFooter className="mt-auto border-t pt-6">
              <div className="w-full space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>৳{cartTotal.toFixed(2)}</span>
                </div>
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetClose>
                 <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm">Add some products to get started.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MobileMenu({ categories }: { categories: any[] }) {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <SheetHeader className="p-6 pb-0">
                 <Link href="/" className="flex items-center gap-2 mb-4" onClick={() => setIsOpen(false)}>
                    <Image src="/assets/logo.png" alt="ShopOn Logo" width={100} height={30} />
                </Link>
            </SheetHeader>
            <div className="p-4">
                <Button asChild className="w-full bg-red-600 text-white hover:bg-red-700">
                    <Link href="/track-order" onClick={() => setIsOpen(false)}>
                        Order Track
                    </Link>
                </Button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 text-base font-medium overflow-y-auto">
                <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors flex items-center justify-between p-4 py-3" onClick={() => setIsOpen(false)}>
                  <span>Home</span>
                </Link>
                <div className="px-4">
                  <h3 className="font-semibold text-primary mb-2">All Categories</h3>
                </div>
                {categories.map(category => (
                    <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="text-foreground/80 hover:text-foreground transition-colors flex items-center justify-between pl-4 pr-3 py-2 hover:bg-muted/50"
                        onClick={() => setIsOpen(false)}
                    >
                        <span>{category.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                ))}
            </nav>
          </SheetContent>
        </Sheet>
    )
}

function DesktopNav({ categories }: { categories: any[] }) {
    return (
        <nav className="hidden md:flex items-center justify-center h-10 border-b">
            <div className="container flex items-center justify-center gap-6 text-sm font-medium">
                {categories.slice(0, 10).map(category => (
                     <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="text-foreground/80 hover:text-primary transition-colors"
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </nav>
    )
}

export default function Header() {
  const { user, loading, isAuthModalOpen, setAuthModalOpen } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  return (
    <>
    <AuthModal open={isAuthModalOpen} onOpenChange={setAuthModalOpen} />
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <MobileMenu categories={categories} />
            <Link href="/" className="hidden md:block">
              <Image src="/assets/logo.png" alt="ShopOn Logo" width={140} height={47} className="h-10 w-auto" />
            </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-lg items-center gap-4">
             <SearchBar />
             <Button variant="outline" asChild>
                <Link href="/track-order">Order Track</Link>
            </Button>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:hidden">
          <Image src="/assets/logo.png" alt="ShopOn Logo" width={120} height={40} className="h-9 w-auto" />
        </Link>

        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
                {!loading && (
                  <>
                    {user ? (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href="/account">
                            <User className="h-6 w-6" />
                            <span className="sr-only">Profile</span>
                          </Link>
                        </Button>
                    ) : (
                         <Button variant="ghost" onClick={() => setAuthModalOpen(true)}>
                            Login
                        </Button>
                    )}
                  </>
                )}
            </div>
            <CartSheet />
        </div>
      </div>
      <DesktopNav categories={categories} />
      <div className="container pb-2 px-4 md:hidden">
        <SearchBar />
      </div>
    </header>
    </>
  );
}
