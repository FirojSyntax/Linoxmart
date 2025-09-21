
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

// This page is a fallback for users who might land here directly.
// It will redirect them to the homepage. The main login flow is now via a modal.
export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/account');
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="ml-4">Redirecting...</p>
    </div>
  );
}
