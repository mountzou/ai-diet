"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut, Loader2, User, Settings } from "lucide-react";

export default function Navbar() {
  const { loading, isAuthenticated, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Prevent scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleClose = () => setMobileOpen(false);

  // Memoize navigation links to avoid recreating them on each render
  const navLinks = React.useMemo(() => [
    { href: "/calendar", label: "Calendar" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" }
  ], []);

  return (
    <nav className="w-full" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* Left section: Brand + Desktop nav */}
        <div className="flex items-center space-x-4">
          {/* Brand */}
          <Link 
            href="/" 
            className="font-bold text-xl hover:text-gray-700 mr-6 transition-colors"
            aria-label="ai-diet home"
          >
            ai-diet
          </Link>

          {/* Desktop nav - now next to the brand */}
          <div className="hidden md:flex space-x-2">
            {navLinks.map(({ href, label }) => (
              <Button key={href} variant="link" asChild>
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <Button disabled variant="ghost" size="sm">
              <Loader2 className="animate-spin h-4 w-4 mr-2" aria-hidden="true" />
              <span>Loading…</span>
            </Button>
          ) : isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile">
                  <User className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>Profile</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">
                  <Settings className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>Account</span>
                </Link>
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-1" aria-hidden="true" />
                <span>Sign Out</span>
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
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Full-screen mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-white flex flex-col" 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
        >
          {/* Header with Brand + close */}
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="font-bold text-xl" onClick={handleClose}>
              ai-diet
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col justify-center items-center space-y-8">
            {navLinks.map(({ href, label }) => (
              <Button
                key={href}
                variant="ghost"
                size="lg"
                className="text-2xl font-medium"
                asChild
                onClick={handleClose}
              >
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </nav>

          {/* Mobile auth */}
          <div className="border-t py-8 px-12 flex flex-col space-y-5">
            {loading ? (
              <Button disabled variant="ghost">
                <Loader2 className="animate-spin h-4 w-4 mr-2" aria-hidden="true" />
                <span>Loading…</span>
              </Button>
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  asChild
                  onClick={handleClose}
                >
                  <Link href="/profile">
                    <User className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  asChild
                  onClick={handleClose}
                >
                  <Link href="/account">
                    <Settings className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span>Account</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-lg"
                  onClick={() => {
                    signOut();
                    handleClose();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <Button
                className="w-full text-lg"
                asChild
                onClick={handleClose}
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}