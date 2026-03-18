"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category } from "@/types";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProductAndCategory = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prodData);
          setSelectedImage(
            prodData.imageUrl ||
              `https://picsum.photos/seed/${prodData.id}/1200/1600`,
          );

          if (prodData.categoryId) {
            const catRef = doc(db, "categories", prodData.categoryId);
            const catSnap = await getDoc(catRef);
            if (catSnap.exists()) {
              setCategory({ id: catSnap.id, ...catSnap.data() } as Category);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndCategory();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      if (product.stock === 0) {
        toast.error("Ce produit est en rupture de stock");
        return;
      }
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl:
          product.imageUrl ||
          `https://picsum.photos/seed/${product.id}/1200/1600`,
      });
      toast.success(`${quantity}x ${product.name} ajouté au panier`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
      </div>
    );

  if (!product)
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">
          Produit introuvable
        </h1>
        <p className="text-neutral-500 mb-8">
          Le pagne que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link
          href="/catalogue"
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-medium transition-colors"
        >
          Retour au catalogue
        </Link>
      </div>
    );

  const allImages = [
    product.imageUrl || `https://picsum.photos/seed/${product.id}/1200/1600`,
    ...(product.thumbnails || []),
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-500 hover:text-amber-600 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
              referrerPolicy="no-referrer"
              priority
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg transform -rotate-12">
                  Rupture de stock
                </span>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                    selectedImage === img
                      ? "border-amber-600 shadow-md"
                      : "border-transparent hover:border-amber-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - vue ${index + 1}`}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col justify-center">
          {category && (
            <div className="mb-4">
              <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {category.name}
              </span>
            </div>
          )}

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-amber-600 mb-8">
            {product.price.toLocaleString("fr-FR")} FCFA
          </p>

          <div className="prose dark:prose-invert max-w-none mb-10 text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
            <p>{product.description}</p>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 mb-10">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2
                className={`w-5 h-5 ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}
              />
              <span className="font-medium">
                {product.stock > 0
                  ? `${product.stock} pièces disponibles en stock`
                  : "Actuellement indisponible"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center border-2 border-neutral-300 dark:border-neutral-700 rounded-full bg-white dark:bg-neutral-950">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-4 hover:text-amber-600 transition-colors disabled:opacity-50"
                  disabled={product.stock === 0 || quantity <= 1}
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-4 hover:text-amber-600 transition-colors disabled:opacity-50"
                  disabled={product.stock === 0 || quantity >= product.stock}
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 w-full flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
              </button>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="space-y-4 text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-8">
            {/* <p>• Livraison disponible partout à Abidjan et à l'intérieur du pays.</p>
            <p>• Paiement sécurisé à la livraison ou par Mobile Money.</p> */}
            <p>• Qualité garantie, 100% coton.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
