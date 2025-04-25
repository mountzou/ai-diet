// src/app/(auth)/login/page.js
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import AuthRedirect from "@/components/AuthRedirect";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import Link from "next/link";

// Define the validation schema using zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useAuth();
  const router = useRouter();

  // Initialize the form with useForm hook
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Define form submission handler
  async function onSubmit(values) {
    if (!auth) {
      toast.error("Authentication not initialized");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sign in user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        // Send another verification email
        await sendEmailVerification(user);
        
        toast.error("Email not verified", {
          description: "We've sent another verification email. Please check your inbox and verify your email before logging in."
        });
        
        // Sign out the user since email is not verified
        await auth.signOut();
        return;
      }
      
      // Email is verified, login successful
      toast.success("Login successful!", {
        description: "Welcome back!"
      });
      
      // Redirect to dashboard or home page
      router.push('/');
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error("Invalid email or password");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many failed login attempts. Please try again later.");
      } else {
        toast.error("Login failed: " + error.message);
      }
      
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRedirect>
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      {...field} 
                    />
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
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !auth}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
    </AuthRedirect>
  );
}