"use client"

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/client/product-card';
import { Loader2, Filter } from 'lucide-react';

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catSnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = catSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(fetchedCategories);

        // Fetch products
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const prodSnapshot = await getDocs(q);
        const fetchedProducts = prodSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Notre Catalogue</h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Explorez notre collection complète de pagnes africains. Des motifs traditionnels aux designs contemporains, trouvez le tissu parfait pour votre prochaine création.
          </p>
        </div>
        
        {/* Filtres */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Filter className="w-5 h-5 text-neutral-500 ml-2" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none outline-none py-2 pr-4 pl-2 text-sm font-medium cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
          <p className="text-neutral-500">Nous n'avons pas de produits correspondant à cette catégorie pour le moment.</p>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')}
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
