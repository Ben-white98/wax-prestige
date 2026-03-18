"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingBag, Tags, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || !isAdmin) return;

    let productsLoaded = false;
    let categoriesLoaded = false;
    let messagesLoaded = false;

    const checkLoading = () => {
      if (productsLoaded && categoriesLoaded && messagesLoaded) {
        setLoading(false);
      }
    };

    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snap) => {
        setStats((prev) => ({ ...prev, products: snap.size }));
        productsLoaded = true;
        checkLoading();
      },
      (error) => {
        console.error("Erreur produits:", error);
        productsLoaded = true;
        checkLoading();
      },
    );

    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snap) => {
        setStats((prev) => ({ ...prev, categories: snap.size }));
        categoriesLoaded = true;
        checkLoading();
      },
      (error) => {
        console.error("Erreur catégories:", error);
        categoriesLoaded = true;
        checkLoading();
      },
    );

    const unsubMessages = onSnapshot(
      collection(db, "messages"),
      (snap) => {
        setStats((prev) => ({ ...prev, messages: snap.size }));
        messagesLoaded = true;
        checkLoading();
      },
      (error) => {
        console.error("Erreur messages:", error);
        messagesLoaded = true;
        checkLoading();
      },
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubMessages();
    };
  }, [user, authLoading, isAdmin]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  const statCards = [
    {
      name: "Produits",
      value: stats.products,
      icon: ShoppingBag,
      href: "/admin/products",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      name: "Catégories",
      value: stats.categories,
      icon: Tags,
      href: "/admin/categories",
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      name: "Messages",
      value: stats.messages,
      icon: MessageSquare,
      href: "/admin/messages",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-bold mt-1 group-hover:text-amber-600 transition-colors">
                  {stat.value}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          Bienvenue dans l'espace administrateur
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Depuis cet espace, vous pouvez gérer l'ensemble du contenu de votre
          boutique Wax Prestige. Utilisez le menu latéral pour naviguer entre
          les différentes sections.
        </p>
      </div>
    </div>
  );
}
