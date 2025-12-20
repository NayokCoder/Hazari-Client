"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Play, User, LogOut, Wallet, Menu, X, Gamepad2 } from "lucide-react";
import UserAvatar from "./shared/UserAvatar";
import InvitationNotifications from "./shared/InvitationNotifications";
import FloatingNotifications from "./shared/FloatingNotifications";
import ConfirmDialog from "./shared/ConfirmDialog";
import { useToast } from "./shared/Toast";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    // Load current user
    const loadUser = () => {
      const currentUser = localStorage.getItem("hazari-current-user");
      if (currentUser) {
        setUser(JSON.parse(currentUser));
      }
    };

    loadUser();

    // Listen for user updates
    const handleUserUpdate = () => {
      console.log("🔄 Header: User data updated, refreshing...");
      loadUser();
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("hazari-current-user");
    setUser(null);
    toast.success("Logged out successfully!");
    router.push("/");
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
    // { href: "/dashboard", label: "Home", icon: Home },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/play", label: "Play", icon: Play },
  ];

  return (
    <header className="glass-effect bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }} className="w-10 h-10 bg-gradient-to-br from-orange-500 via-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-purple-600 bg-clip-text text-transparent">Hazari</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg" : "text-foreground/80 hover:bg-accent/50 hover:text-orange-400"}`}>
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section - Desktop */}
          <div className="flex items-center gap-4">
            <InvitationNotifications playerId={user.playerId} />
            <div className="hidden md:flex items-center gap-4">
              {/* Balance Display */}
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-orange-500/30">
                <Wallet className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">৳ {user.balance}</span>
              </div>

              {/* User Info */}
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 rounded-lg transition-all group">
                <UserAvatar name={user.name} size="sm" showOnline={true} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground group-hover:text-orange-400 transition-colors">{user.name}</p>
                  <p className="text-xs text-muted-foreground">View Profile</p>
                </div>
              </Link>

              {/* Logout Button */}
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors text-foreground">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden py-4 border-t border-border">
            {/* User Profile Section - Mobile */}
            <div className="mb-4 p-4 bg-gradient-to-br from-purple-500/10 via-orange-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar name={user.name} size="md" showOnline={true} />
                <div className="flex-1">
                  <p className="font-bold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{user.playerId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <Wallet className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">৳ {user.balance}</span>
              </div>
            </div>

            {/* Grid Menu Layout */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-orange-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-card/50 backdrop-blur-sm text-foreground/80 hover:bg-accent/70 border border-border"
                    }`}
                  >
                    <link.icon className="w-8 h-8" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Button - Full Width */}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Floating Notifications - Global */}
      <FloatingNotifications playerId={user.playerId} />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Confirm Logout"
        description="Are you sure you want to logout? You will need to login again to access your account."
        onConfirm={confirmLogout}
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
      />
    </header>
  );
}
