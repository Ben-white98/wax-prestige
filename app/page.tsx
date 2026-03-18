"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/client/product-card";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { StoreLocation } from "@/components/store-location";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(4),
        );
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarousel />

      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Nouveaux Arrivages
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Découvrez nos dernières collections de pagnes.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="hidden md:flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            Voir tout le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-12">
            Aucun produit disponible pour le moment.
          </p>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            Voir tout le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <StoreLocation />
    </div>
  );
}
