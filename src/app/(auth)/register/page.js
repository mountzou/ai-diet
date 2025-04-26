// src/app/(auth)/register/page.js
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestoreDb } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import AuthRedirect from "@/components/AuthRedirect";

// Define the validation schema using zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useAuth();
  const router = useRouter();

  // Initialize the form with useForm hook
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
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
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Create user document in Firestore (empty document)
      try {
        const db = await getFirestoreDb();
        
        // Create an empty document with the user's ID as the document ID
        await setDoc(doc(db, "users", user.uid), {});
        
        console.log("User document created in Firestore");
      } catch (firestoreError) {
        console.error("Error creating user document:", firestoreError);
        // We don't want to fail the registration if Firestore fails
        // Just log it and continue
      }
      
      // Sign out the user immediately after registration
      await auth.signOut();
      
      // User created successfully
      toast.success("Account created successfully!", {
        description: "We've sent a verification email to your address. Please check your inbox."
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak");
      } else {
        toast.error("Registration failed: " + error.message);
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
              Create an account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
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
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !auth}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AuthRedirect>
  );
}