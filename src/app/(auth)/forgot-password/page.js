// src/app/(auth)/forgot-password/page.js
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
import { useAuth } from "@/contexts/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import AuthRedirect from "@/components/AuthRedirect";

// Define the validation schema using zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { auth } = useAuth();

  // Initialize the form with useForm hook
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
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
      // Send password reset email
      await sendPasswordResetEmail(auth, values.email);
      
      // Email sent successfully
      setEmailSent(true);
      toast.success("Password reset email sent", {
        description: "Please check your inbox for instructions to reset your password."
      });
      
    } catch (error) {
      console.error("Password reset error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        // For security reasons, we don't want to reveal if an email exists or not
        // So we show the same success message even if the email doesn't exist
        setEmailSent(true);
        toast.success("If this email exists in our system, a password reset link has been sent.");
      } else {
        toast.error("Failed to send password reset email: " + error.message);
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
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Well send you an email with a link to reset your password
            </p>
          </div>
          
          {emailSent ? (
            <div className="bg-green-50 p-4 rounded-md text-center">
              <h3 className="text-lg font-medium text-green-800">Check your email</h3>
              <p className="mt-2 text-sm text-green-700">
                Weve sent password reset instructions to the email address you provided.
              </p>
              <div className="mt-4">
                <Button asChild variant="link">
                  <Link href="/login">Return to login</Link>
                </Button>
              </div>
            </div>
          ) : (
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
                          placeholder="Enter your email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Back to login
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
                      Sending...
                    </>
                  ) : (
                    "Send reset instructions"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </AuthRedirect>
  );
}