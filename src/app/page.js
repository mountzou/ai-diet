// src/app/page.js
"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WeightTracker from "@/components/home/WeightTracker";
import FatTracker from "@/components/home/FatTracker";
import WeightHistory from "@/components/home/WeightHistory";

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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

        {user && (
          <div className="mt-8 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Add Weight Component */}
              <WeightTracker />
              {/* Add Fat Component */}
              <FatTracker />
            </div>
            
            {/* Weight History Component - full width */}
            <div className="mt-4">
              <WeightHistory />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}