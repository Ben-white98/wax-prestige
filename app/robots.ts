import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/login/'], // On empêche Google d'indexer l'espace admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
