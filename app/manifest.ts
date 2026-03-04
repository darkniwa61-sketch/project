import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'St. Joseph APDC',
    short_name: 'St. Joseph APDC',
    description: 'St. Joseph Amity Prime Inventory System',
    start_url: '/login',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
