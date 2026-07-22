import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/*?*sort=',
        '/*?*filter=',
        '/*?*page=',
        '/*?*utm_',
      ],
    },
    sitemap: 'https://gryps.vercel.app/sitemap.xml',
  }
}
