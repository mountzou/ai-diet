// src/app/page.js
"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WeightTracker from "@/components/dashboard/WeightTracker";
import FatTracker from "@/components/dashboard/FatTracker";
import WeightHistory from "@/components/dashboard/WeightHistory";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-8 text-center">
        {user ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
            <p className="text-xl text-gray-600">
              Hello, <span className="font-medium">{user.email}</span>!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome to Our App</h1>
            <p className="text-gray-600">
              This is a secure area that requires authentication. Please use the login button in the navigation bar to access your account.
            </p>
          </div>
        )}

        {/* Firestore Connection Status */}
        <div className="mt-8 pt-2  ">

          {/* Add Weight Component */}
          <WeightTracker />
          {/* Add Fat Component */}
          <FatTracker />

          {/* Weight History Component */}
          <WeightHistory />
        </div>
      </div>
    </div>
  );
}