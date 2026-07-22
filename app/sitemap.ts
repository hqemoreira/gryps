import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://gryps.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://gryps.vercel.app/legal/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://gryps.vercel.app/legal/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
