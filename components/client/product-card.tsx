"use client"

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || `https://picsum.photos/seed/${product.id}/800/1066`
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <Link href={`/produit/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
        <Image 
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/800/1066`} 
          alt={product.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer" 
        />
        {/* Add to cart button overlay */}
        <button 
          onClick={handleAddToCart} 
          className="absolute bottom-4 right-4 bg-amber-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-amber-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
          disabled={product.stock === 0}
          aria-label="Ajouter au panier"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
            Rupture
          </div>
        )}
      </div>
      <h3 className="font-medium text-lg group-hover:text-amber-600 transition-colors line-clamp-1">{product.name}</h3>
      <p className="font-bold text-lg">{product.price.toLocaleString('fr-FR')} FCFA</p>
    </Link>
  );
}
