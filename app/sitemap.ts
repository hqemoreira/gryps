import { MetadataRoute } from 'next'
import { KNOWLEDGE_ARTICLES } from '@/lib/knowledge-articles'
import { getAllResearchEntries } from '@/lib/research-library'
import { getAllMissionScenarios } from '@/lib/mission-scenarios'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://gryps.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://gryps.vercel.app/research', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://gryps.vercel.app/scenarios', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.88 },
    { url: 'https://gryps.vercel.app/workspace', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
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

  const researchPages: MetadataRoute.Sitemap = getAllResearchEntries().map(e => ({
    url: `https://gryps.vercel.app/research/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const scenarioPages: MetadataRoute.Sitemap = getAllMissionScenarios().map(s => ({
    url: `https://gryps.vercel.app/scenarios/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.78,
  }))

  return [...staticPages, ...knowledgePages, ...researchPages, ...scenarioPages]
}
