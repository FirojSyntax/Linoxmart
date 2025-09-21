
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  emailOrPhone: z.string().min(1, "Please enter your email or phone number."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Firebase Auth primarily uses email for login. 
      // To log in with a phone number, you would typically use Firebase's phone authentication flow,
      // which involves sending an SMS code. A simple email/password form can't handle both directly.
      // For this implementation, we'll assume the user enters an email.
      // A more complex setup would be needed for true email/phone login.
      await signInWithEmailAndPassword(auth, values.emailOrPhone, values.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/account");
      onSuccess();
    } catch (error: any) {
       let errorMessage = error.message;
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
            errorMessage = "Invalid credentials. Please check your email and password and try again.";
        }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="emailOrPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com or 01xxxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
