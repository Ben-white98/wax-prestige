"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  Crown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/components/auth-provider";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();

  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-2xl md:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-500 group"
        >
          <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Crown className="w-6 h-6 md:w-7 md:h-7 text-amber-600 dark:text-amber-500" />
          </div>
          <span>Wax Prestige</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="hover:text-amber-600 transition-colors">
            Accueil
          </Link>
          <Link
            href="/catalogue"
            className="hover:text-amber-600 transition-colors"
          >
            Catalogue
          </Link>
          <Link
            href="/contact"
            className="hover:text-amber-600 transition-colors"
          >
            Contact
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Basculer le thème"
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {user && (
            <button
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-red-500"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <nav className="flex flex-col p-4 gap-4 font-medium">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-amber-600 transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/catalogue"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-amber-600 transition-colors"
            >
              Catalogue
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-amber-600 transition-colors"
            >
              Contact
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ShieldCheck className="w-5 h-5" /> Admin
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-left"
              >
                <LogOut className="w-5 h-5" /> Se déconnecter
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
