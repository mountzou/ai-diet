"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut, Loader2, User, Settings } from "lucide-react";

export default function Navbar() {
  const { loading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleClose = () => setMobileOpen(false);
  const navigate = (href) => {
    router.push(href);
    handleClose();
  };

  return (
    <nav className="w-full border-b">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="font-bold text-xl hover:text-gray-700">
          Brand
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex space-x-4">
          <Button variant="link" asChild>
            <Link href="/calendar">Calendar</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/faq">FAQ</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <Button disabled variant="ghost" size="sm">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Loading…
            </Button>
          ) : isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">
                  <Settings className="h-4 w-4 mr-1" />
                  Account
                </Link>
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Full-screen mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header with Brand + close */}
          <div className="flex items-center justify-between p-4">
            <span className="font-bold text-xl">Brand</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col justify-center items-center space-y-8">
            <button
              onClick={() => navigate("/calendar")}
              className="text-2xl font-medium hover:text-gray-600"
            >
              Calendar
            </button>
            <button
              onClick={() => navigate("/faq")}
              className="text-2xl font-medium hover:text-gray-600"
            >
              FAQ
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-2xl font-medium hover:text-gray-600"
            >
              Contact
            </button>
          </nav>

          {/* Auth actions */}
          <div className="border-t py-16 px-12 flex flex-col space-y-5">
            {loading ? (
              <Button disabled variant="ghost">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Loading…
              </Button>
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  onClick={() => navigate("/account")}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Account
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-lg"
                  onClick={() => {
                    signOut();
                    handleClose();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                className="w-full text-lg"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
