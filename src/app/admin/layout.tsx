
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import AdminSidebar from "@/components/admin/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, setAuthModalOpen } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (loading) {
      return; // Wait until Firebase auth state is loaded
    }

    if (!user) {
      // If user is not logged in, open the modal and stop checking.
      setAuthModalOpen(true);
      setIsCheckingAdmin(false);
      return;
    }

    // If we have a user, check their admin status.
    const checkAdminStatus = async () => {
      // In a real app, you would have a 'roles' collection or a field on the user document.
      const userDocRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        
        // Primary check: 'role' field in Firestore document
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } 
        // Fallback check: hardcoded UID
        else if (user.uid === "454sh6Z63gY6rVVd0PZ1tkfgdAO2") { 
           setIsAdmin(true);
        } else {
           // If neither check passes, they are not an admin.
           setIsAdmin(false);
           console.warn("Access denied. User is not an admin.");
           router.replace("/"); // Redirect non-admins to the homepage
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.replace("/");
      } finally {
        // We are done checking, so stop showing the loading state.
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, router, setAuthModalOpen]);


  if (loading || isCheckingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
         <p className="ml-4">Verifying access...</p>
      </div>
    );
  }

  // If we are done checking and the user is not an admin, show the appropriate message.
  if (!isAdmin) {
      return (
         <div className="flex h-screen items-center justify-center text-center p-4">
            <div>
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground mt-2">
                {user ? "You do not have permission to view this page." : "Please log in to access the admin panel."}
              </p>
            </div>
        </div>
      );
  }

  // If all checks pass, render the admin panel.
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 bg-muted/40">
          {children}
      </main>
    </div>
  );
}
