"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Play, User, LogOut, Wallet, Menu, X, Gamepad2 } from "lucide-react";
import UserAvatar from "./shared/UserAvatar";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load current user
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("hazari-current-user");
      setUser(null);
      router.push("/");
    }
  };

  // Don't show header on auth pages or home page (login/signup page)
  if (pathname === "/" || pathname?.startsWith("/auth")) {
    return null;
  }

  // If no user logged in, don't show header
  if (!user) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/play", label: "Play", icon: Play },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Gamepad2 className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hazari
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Balance Display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">₹{user.balance}</span>
            </div>

            {/* User Info */}
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all group"
            >
              <UserAvatar name={user.name} size="sm" showOnline={true} />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-gray-100"
          >
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <UserAvatar name={user.name} size="md" showOnline={true} />
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Wallet className="w-3 h-3 text-green-600" />
                  <span className="text-sm font-medium text-green-600">₹{user.balance}</span>
                </div>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Logout Mobile */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
