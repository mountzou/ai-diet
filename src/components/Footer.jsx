// src/components/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600">© 2025 Your Company. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">FAQ</Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}