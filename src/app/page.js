// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import WeightTracker from "@/components/dashboard/WeightTracker";
import WeightHistory from "@/components/dashboard/WeightHistory";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [dbStatus, setDbStatus] = useState(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  const testFirestoreConnection = async () => {
    setIsTestingDb(true);
    try {
      // Get Firestore instance
      const db = await getFirestoreDb();
      
      // Try to access a collection (this might fail with permission error in test mode)
      try {
        const collectionsSnapshot = await getDocs(collection(db, "users"));
        console.log("Collections:", collectionsSnapshot.docs.map(doc => doc.id));
        setDbStatus({
          connected: true,
          message: "Successfully connected to Firestore and accessed collection"
        });
      } catch (collectionError) {
        // This is expected in test mode with no collections set up
        if (collectionError.code === 'permission-denied' || collectionError.code === 'not-found') {
          setDbStatus({
            connected: true,
            message: "Connected to Firestore (expected permission error with test collection)"
          });
        } else {
          throw collectionError;
        }
      }
      
      console.log("Firestore connection successful!");
      
    } catch (error) {
      console.error("Firestore connection test error:", error);
      
      setDbStatus({
        connected: false,
        message: `Failed to connect to Firestore: ${error.message}`
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  useEffect(() => {
    // Auto-test the connection when the component mounts
    testFirestoreConnection();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Firestore Connection Status</h2>
          
          {isTestingDb ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span>Testing connection...</span>
            </div>
          ) : dbStatus ? (
            <div className={`p-4 rounded-md ${dbStatus.connected ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-medium ${dbStatus.connected ? 'text-green-800' : 'text-red-800'}`}>
                {dbStatus.connected ? '✅ Connected' : '❌ Connection Failed'}
              </p>
              <p className={`text-sm mt-1 ${dbStatus.connected ? 'text-green-700' : 'text-red-700'}`}>
                {dbStatus.message}
              </p>
            </div>
          ) : (
            <p>Initializing connection test...</p>
          )}
          
          <Button 
            onClick={testFirestoreConnection}
            disabled={isTestingDb}
            variant="outline"
            className="mt-4"
          >
            {isTestingDb ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection Again"
            )}
          </Button>

          {/* Weight Tracker Component */}
          <WeightTracker />

          {/* Weight History Component */}
          <WeightHistory />
        </div>
      </div>
    </div>
  );
}