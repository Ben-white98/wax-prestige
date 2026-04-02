"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/client/product-card";
import { Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function CataloguePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch categories only once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catSnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = catSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Erreur catégories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    const fetchInitialProducts = async () => {
      setLoading(true);
      setHasMore(true);
      setLastVisible(null);

      try {
        let q;
        if (selectedCategory === "all") {
          q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc"),
            limit(itemsPerPage),
          );
        } else {
          // Note: We drop orderBy('createdAt', 'desc') here to avoid requiring a composite index in Firestore
          // If you want to order by date AND filter by category, you must create a composite index in Firebase Console.
          q = query(
            collection(db, "products"),
            where("categoryId", "==", selectedCategory),
            limit(itemsPerPage),
          );
        }

        const prodSnapshot = await getDocs(q);

        const fetchedProducts = prodSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setAllProducts(fetchedProducts);
        setCurrentPage(0);

        if (prodSnapshot.docs.length < itemsPerPage) {
          setHasMore(false);
        } else {
          setLastVisible(prodSnapshot.docs[prodSnapshot.docs.length - 1]);
        }
      } catch (error) {
        console.error("Erreur produits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, [selectedCategory, itemsPerPage]);

  const handleNextPage = async () => {
    // Si on a déjà les produits en mémoire, on passe juste à la page suivante
    if ((currentPage + 1) * itemsPerPage < allProducts.length) {
      setCurrentPage((prev) => prev + 1);
      return;
    }

    // Sinon, on va chercher la suite sur Firebase
    if (!lastVisible || !hasMore) return;

    setLoadingMore(true);
    try {
      let q;
      if (selectedCategory === "all") {
        q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage),
        );
      } else {
        q = query(
          collection(db, "products"),
          where("categoryId", "==", selectedCategory),
          startAfter(lastVisible),
          limit(itemsPerPage),
        );
      }

      const prodSnapshot = await getDocs(q);

      const newProducts = prodSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setAllProducts((prev) => [...prev, ...newProducts]);
      setCurrentPage((prev) => prev + 1);

      if (prodSnapshot.docs.length < itemsPerPage) {
        setHasMore(false);
      } else {
        setLastVisible(prodSnapshot.docs[prodSnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Erreur chargement supplémentaire:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  // Produits à afficher pour la page courante
  const currentProducts = allProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );
  const isNextDisabled =
    !hasMore && (currentPage + 1) * itemsPerPage >= allProducts.length;
  const isPrevDisabled = currentPage === 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Notre Catalogue
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Explorez notre collection complète de pagnes africains. Des motifs
            traditionnels aux designs contemporains, trouvez le tissu parfait
            pour votre prochaine création.
          </p>
        </div>

        {/* Filtres & Pagination */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <Filter className="w-5 h-5 text-neutral-500 ml-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none outline-none py-2 pr-4 pl-2 text-sm font-medium cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-sm font-medium text-neutral-500 ml-2">
              Afficher:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-transparent border-none outline-none py-2 pr-4 pl-2 text-sm font-medium cursor-pointer"
            >
              <option value={5}>5 par page</option>
              <option value={10}>10 par page</option>
              <option value={12}>12 par page</option>
              <option value={20}>20 par page</option>
              <option value={30}>30 par page</option>
              <option value={50}>50 par page</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        </div>
      ) : currentProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination stylisée avec flèches */}
          {(allProducts.length > itemsPerPage || hasMore) && (
            <div className="mt-16 flex items-center justify-center gap-6">
              <button
                onClick={handlePrevPage}
                disabled={isPrevDisabled || loadingMore}
                className="group flex items-center justify-center w-14 h-14 rounded-full border-2 border-amber-600 text-amber-600 dark:text-amber-500 hover:bg-amber-600 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-600 shadow-sm hover:shadow-lg hover:shadow-amber-600/20"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-7 h-7 transition-transform group-hover:-translate-x-1" />
              </button>

              <span className="text-lg font-medium text-neutral-600 dark:text-neutral-400 min-w-[80px] text-center">
                Page {currentPage + 1}
              </span>

              <button
                onClick={handleNextPage}
                disabled={isNextDisabled || loadingMore}
                className="group flex items-center justify-center w-14 h-14 rounded-full border-2 border-amber-600 text-amber-600 dark:text-amber-500 hover:bg-amber-600 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-600 shadow-sm hover:shadow-lg hover:shadow-amber-600/20"
                aria-label="Page suivante"
              >
                {loadingMore ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <ChevronRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-32 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
          <p className="text-neutral-500">
            Nous n'avons pas de produits correspondant à cette catégorie pour le
            moment.
          </p>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 text-amber-600 font-medium hover:underline"
            >
              Voir tous les produits
            </button>
          )}
        </div>
      )}
    </div>
  );
}
