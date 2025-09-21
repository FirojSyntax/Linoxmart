
"use client";

import Link from "next/link";
import { Home, LayoutGrid, User, ShoppingCart } from "lucide-react";
import { useAuth } from "../providers/auth-provider";
import { Button } from "../ui/button";

export default function Footer() {
  const { user, setAuthModalOpen } = useAuth();
  
  const handleAuthClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <>
    <div className="h-16 md:hidden"></div>
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-40">
      <div className="container h-16 flex items-center justify-around text-xs text-muted-foreground">
        <Link href="/#categories" className="flex flex-col items-center gap-1">
          <LayoutGrid className="h-5 w-5" />
          <span>Category</span>
        </Link>
        <Link href="/track-order" className="flex flex-col items-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-search"><path d="M21 10V6.73a2 2 0 0 0-1.4-1.9L13.8.2a2 2 0 0 0-2.8 0L5.4 4.83A2 2 0 0 0 4 6.73V10"/><path d="m9 12-2 2 2 2"/><path d="m13 12 2 2-2 2"/><path d="M17.5 17.5 22 22"/><path d="M21 10v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4H4"/></svg>
          <span>Track</span>
        </Link>
        <Link href="/" className="flex flex-col items-center gap-1 -mt-6">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Home className="h-7 w-7" />
          </div>
          <span className="mt-1">Home</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center gap-1">
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
        </Link>
        <Link href={user ? "/account" : "/login"} onClick={handleAuthClick} className="flex flex-col items-center gap-1">
          <User className="h-5 w-5" />
          <span>{user ? "Account" : "Login"}</span>
        </Link>
      </div>
    </footer>
    </>
  );
}
