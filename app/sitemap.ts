import { MetadataRoute } from 'next'
import { getAllSites } from '@/lib/signatures-db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://gryps.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://gryps.vercel.app/signatures', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://gryps.vercel.app/legal/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://gryps.vercel.app/legal/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  try {
    const sites = await getAllSites()
    const sitePages: MetadataRoute.Sitemap = sites.map(s => ({
      url: `https://gryps.vercel.app/signatures/${s.slug}`,
      lastModified: new Date(s.last_scored_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
    return [...staticPages, ...sitePages]
  } catch (err) {
    console.error('Failed to load signature sites for sitemap:', err)
    return staticPages
  }
}
