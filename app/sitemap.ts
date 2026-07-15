import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://gryps.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://gryps.vercel.app/compare', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
