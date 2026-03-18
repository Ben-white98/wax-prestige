"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  MessageSquare,
  LogOut,
  Loader2,
  Menu,
  X,
  Crown,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  const navItems = [
    { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { name: "Produits", href: "/admin/products", icon: ShoppingBag },
    { name: "Catégories", href: "/admin/categories", icon: Tags },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-serif text-2xl font-bold text-amber-600"
          >
            <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-lg">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            Admin
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                  ${
                    isActive
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-lg">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <span className="font-serif text-xl font-bold text-amber-600">
              Admin
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
