import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Remplacez par votre vrai nom de domaine quand vous en aurez un
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.com';

  // 1. Routes statiques de votre site
  const staticRoutes = [
    '',
    '/catalogue',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Routes dynamiques (Vos produits depuis Firebase)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    productRoutes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Essayer de récupérer la date de mise à jour ou de création
      let lastModified = new Date();
      if (data.updatedAt) {
         lastModified = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
      } else if (data.createdAt) {
         lastModified = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      }

      return {
        url: `${baseUrl}/produit/${doc.id}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap pour les produits:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
