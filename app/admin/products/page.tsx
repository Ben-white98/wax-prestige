"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category } from "@/types";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import Papa from "papaparse";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodSnap, catSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
      ]);

      const catMap: Record<string, string> = {};
      catSnap.docs.forEach((doc) => {
        catMap[doc.id] = doc.data().name;
      });
      setCategories(catMap);

      const fetched = prodSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(fetched);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        toast.success("Produit supprimé");
        setSelectedIds((prev) =>
          prev.filter((selectedId) => selectedId !== id),
        );
        fetchData();
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} produits ?`,
      )
    ) {
      setIsDeletingBulk(true);
      try {
        await Promise.all(
          selectedIds.map((id) => deleteDoc(doc(db, "products", id))),
        );
        toast.success(`${selectedIds.length} produits supprimés avec succès`);
        setSelectedIds([]);
        fetchData();
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la suppression groupée");
      } finally {
        setIsDeletingBulk(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<any>) => {
        try {
          let importedCount = 0;
          for (const row of results.data as any[]) {
            const name = row.name || row.Nom || "";
            const price = parseFloat(row.price || row.Prix || "0");
            const stock = parseInt(row.stock || row.Stock || "0", 10);
            const description = row.description || row.Description || "";
            const categoryId = row.categoryId || row.Categorie || "";
            const imageUrl = row.imageUrl || row.Image || "";

            if (name) {
              await addDoc(collection(db, "products"), {
                name,
                price: isNaN(price) ? 0 : price,
                stock: isNaN(stock) ? 0 : stock,
                description,
                categoryId,
                imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              importedCount++;
            }
          }
          toast.success(`${importedCount} produits importés avec succès !`);
          fetchData();
        } catch (error) {
          console.error("Erreur d'importation:", error);
          toast.error("Erreur lors de l'importation des produits");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error: Error) => {
        console.error("Erreur de parsing CSV:", error);
        toast.error("Erreur lors de la lecture du fichier CSV");
        setIsImporting(false);
      },
    });
  };

  const downloadTemplate = () => {
    // En-têtes du CSV. On ajoute une colonne pour le nom de la catégorie (pour aider l'utilisateur)
    let csvContent =
      "name,price,stock,description,categoryId,imageUrl,nom_categorie_INFO\n";

    const categoryEntries = Object.entries(categories);

    if (categoryEntries.length > 0) {
      // Générer une ligne d'exemple pour chaque catégorie existante
      categoryEntries.forEach(([id, name]) => {
        csvContent += `Produit exemple (${name}),15000,10,Description du produit,${id},https://via.placeholder.com/150,${name}\n`;
      });
    } else {
      // Fallback si aucune catégorie n'existe
      csvContent +=
        "Mon Pagne,15000,10,Description du pagne,id_categorie_ici,https://via.placeholder.com/150,Aucune categorie\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modele_produits_preconfigure.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Produits</h1>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors text-sm border border-red-200 dark:border-red-800/50"
            >
              {isDeletingBulk ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Supprimer ({selectedIds.length})
            </button>
          )}
          <button
            onClick={downloadTemplate}
            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors text-sm"
            title="Télécharger le modèle CSV"
          >
            <Download className="w-4 h-4" /> Modèle CSV
          </button>

          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
          >
            {isImporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            Importer CSV
          </button>

          <Link
            href="/admin/products/new"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Ajouter
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 &&
                      selectedIds.length === products.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium text-neutral-500 w-24">Image</th>
                <th className="p-4 font-medium text-neutral-500">Nom</th>
                <th className="p-4 font-medium text-neutral-500">Catégorie</th>
                <th className="p-4 font-medium text-neutral-500">Prix</th>
                <th className="p-4 font-medium text-neutral-500">Stock</th>
                <th className="p-4 font-medium text-neutral-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/50 transition-colors ${selectedIds.includes(product.id) ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-neutral-500">
                      {product.categoryId
                        ? categories[product.categoryId] || "Inconnue"
                        : "Aucune"}
                    </td>
                    <td className="p-4 font-bold text-amber-600">
                      {product.price.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
