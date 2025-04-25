// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Loader2, User } from "lucide-react";

export default function Navbar() {
  const { user, loading, isAuthenticated, signOut } = useAuth();

  return (
    <div className="w-full border-b">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* Brand on the left with link to homepage */}
        <Link href="/" className="font-bold text-xl text-black hover:text-gray-700 transition-colors">
          Brand
        </Link>

        {/* Navigation in the middle */}
        <div className="flex space-x-4">
          <Button variant="link" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/faq">FAQ</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>

        {/* Auth buttons on the right */}
        {loading ? (
          <Button disabled variant="ghost">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        ) : isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/account">
                <User className="h-4 w-4 mr-2" />
                Account
              </Link>
            </Button>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}