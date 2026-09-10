import { MetadataRoute } from 'next'
import { getAllSites } from '@/lib/signatures-db'
import { KNOWLEDGE_ARTICLES } from '@/lib/knowledge-articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://gryps.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://gryps.vercel.app/signatures', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://gryps.vercel.app/map', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: 'https://gryps.vercel.app/about', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: 'https://gryps.vercel.app/methodology', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://gryps.vercel.app/knowledge', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://gryps.vercel.app/providers', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: 'https://gryps.vercel.app/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://gryps.vercel.app/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const knowledgePages: MetadataRoute.Sitemap = KNOWLEDGE_ARTICLES.map((a) => ({
    url: `https://gryps.vercel.app/knowledge/${a.slug}`,
    lastModified: new Date(a.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  try {
    const sites = await getAllSites()
    const sitePages: MetadataRoute.Sitemap = sites.map(s => ({
      url: `https://gryps.vercel.app/signatures/${s.slug}`,
      lastModified: new Date(s.last_scored_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
    return [...staticPages, ...knowledgePages, ...sitePages]
  } catch (err) {
    console.error('Failed to load signature sites for sitemap:', err)
    return [...staticPages, ...knowledgePages]
  }
}
