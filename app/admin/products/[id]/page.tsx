"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category, Product } from "@/types";
import { Loader2, ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";
  const id = params.id as string;

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const catSnap = await getDocs(collection(db, "categories"));
        const fetchedCats = catSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(fetchedCats);

        // Fetch product if not new
        if (!isNew) {
          const prodDoc = await getDoc(doc(db, "products", id));
          if (prodDoc.exists()) {
            const data = prodDoc.data() as Product;
            setFormData({
              name: data.name,
              description: data.description,
              price: data.price,
              stock: data.stock,
              categoryId: data.categoryId,
              imageUrl: data.imageUrl || "",
            });
          } else {
            toast.error("Produit introuvable");
            router.push("/admin/products");
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast.error("Veuillez remplir correctement les champs obligatoires");
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (isNew) {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success("Produit ajouté avec succès");
      } else {
        await updateDoc(doc(db, "products", id), {
          ...productData,
          updatedAt: serverTimestamp(),
        });
        toast.success("Produit mis à jour avec succès");
      }
      router.push("/admin/products");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold">
          {isNew ? "Nouveau Produit" : "Modifier le produit"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden"
      >
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informations principales */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Catégorie *</label>
                <Link
                  href="/admin/categories"
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Gérer les catégories
                </Link>
              </div>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="" disabled>
                  Sélectionner une catégorie
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                  <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
                    Vous devez d'abord créer au moins une catégorie avant
                    d'ajouter un produit.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const defaultCategories = [
                          "Wax Hollandais",
                          "Woodin",
                          "Uniwax",
                          "Hitarget",
                        ];
                        for (const cat of defaultCategories) {
                          await addDoc(collection(db, "categories"), {
                            name: cat,
                            description: `Catégorie ${cat}`,
                            createdAt: serverTimestamp(),
                          });
                        }
                        toast.success("Catégories par défaut créées !");
                        // Refresh categories
                        const catSnap = await getDocs(
                          collection(db, "categories"),
                        );
                        setCategories(
                          catSnap.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                          })) as Category[],
                        );
                      } catch (error) {
                        toast.error("Erreur lors de la création");
                      }
                    }}
                    className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Créer des catégories par défaut
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              />
              <p className="text-xs text-neutral-500 mb-4">
                Pour cet aperçu, vous pouvez utiliser une URL d'image publique
                (ex: Unsplash, Picsum).
              </p>

              <div className="aspect-[3/4] w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center relative">
                {formData.imageUrl ? (
                  <Image
                    src={formData.imageUrl}
                    alt="Aperçu"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-neutral-400 mb-2" />
                    <span className="text-neutral-500 font-medium">
                      Aperçu de l'image
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isNew ? "Créer le produit" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
