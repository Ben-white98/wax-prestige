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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Category, Product } from "@/types";
import {
  Loader2,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newThumbnailUrl, setNewThumbnailUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    imageUrl: "",
    thumbnails: [] as string[],
    isPromo: false,
    promoPrice: 0,
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
              thumbnails: data.thumbnails || [],
              isPromo: data.isPromo || false,
              promoPrice: data.promoPrice || 0,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Erreur d'upload:", error);
          toast.error("Erreur lors du téléchargement de l'image");
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData({ ...formData, imageUrl: downloadURL });
          setIsUploading(false);
          toast.success("Image téléchargée avec succès");
        },
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du téléchargement");
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    setIsUploadingThumbnail(true);
    setThumbnailProgress(0);

    try {
      const storageRef = ref(
        storage,
        `products/thumbnails/${Date.now()}_${file.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setThumbnailProgress(progress);
        },
        (error) => {
          console.error("Erreur d'upload:", error);
          toast.error("Erreur lors du téléchargement de l'image");
          setIsUploadingThumbnail(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData((prev) => ({
            ...prev,
            thumbnails: [...prev.thumbnails, downloadURL],
          }));
          setIsUploadingThumbnail(false);
          toast.success("Image ajoutée à la galerie");
        },
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du téléchargement");
      setIsUploadingThumbnail(false);
    }
  };

  const handleAddThumbnailUrl = () => {
    if (!newThumbnailUrl.trim()) return;

    // Basic URL validation
    try {
      new URL(newThumbnailUrl);
      setFormData((prev) => ({
        ...prev,
        thumbnails: [...prev.thumbnails, newThumbnailUrl],
      }));
      setNewThumbnailUrl("");
      toast.success("Image ajoutée à la galerie");
    } catch (e) {
      toast.error("Veuillez entrer une URL valide");
    }
  };

  const removeThumbnail = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails.filter((_, index) => index !== indexToRemove),
    }));
  };

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

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPromo"
                  checked={formData.isPromo}
                  onChange={(e) =>
                    setFormData({ ...formData, isPromo: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <label
                  htmlFor="isPromo"
                  className="text-sm font-medium text-amber-900 dark:text-amber-100"
                >
                  Mettre ce produit en promotion (Affiché dans le carrousel
                  d'accueil)
                </label>
              </div>

              {formData.isPromo && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-amber-900 dark:text-amber-100">
                    Prix promotionnel (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.promoPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promoPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required={formData.isPromo}
                  />
                </div>
              )}
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
                Image du produit
              </label>

              <div className="mb-6 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    isUploading
                      ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Téléchargement... {Math.round(uploadProgress)}%
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Télécharger une image depuis votre appareil
                    </>
                  )}
                </label>
                <p className="text-xs text-neutral-500 mt-3">
                  Formats acceptés : JPG, PNG, WebP. Taille max : 5Mo.
                </p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"></div>
                <span className="text-sm text-neutral-500 font-medium">OU</span>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"></div>
              </div>

              <label className="block text-sm font-medium mb-2">
                URL de l'image (Lien externe)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 mb-6"
              />

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

            {/* Galerie d'images (Thumbnails) */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <label className="block text-sm font-medium mb-2">
                Galerie d'images (Optionnel)
              </label>
              <p className="text-xs text-neutral-500 mb-4">
                Ajoutez d'autres images pour montrer plus de détails.
              </p>

              <div className="flex gap-2 mb-6">
                <input
                  type="url"
                  value={newThumbnailUrl}
                  onChange={(e) => setNewThumbnailUrl(e.target.value)}
                  placeholder="https://exemple.com/image-detail.jpg"
                  className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddThumbnailUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddThumbnailUrl}
                  className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                >
                  Ajouter
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.thumbnails.map((thumbUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 group"
                  >
                    <Image
                      src={thumbUrl}
                      alt={`Miniature ${index + 1}`}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => removeThumbnail(index)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
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
