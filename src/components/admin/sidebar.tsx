
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Shapes, ShoppingCart, Users, LogOut, CreditCard, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "../providers/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/payment-numbers", label: "Payment Numbers", icon: CreditCard },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
//   { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };


  return (
    <aside className="w-64 flex-shrink-0 bg-background border-r flex flex-col">
      <div className="p-6 border-b">
         <Link href="/admin">
            <h1 className="text-2xl font-bold font-headline text-primary">Admin Panel</h1>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
              (pathname === link.href || pathname.startsWith(`${link.href}/`)) && "bg-muted text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="text-sm font-semibold">{user?.displayName || "Admin User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
