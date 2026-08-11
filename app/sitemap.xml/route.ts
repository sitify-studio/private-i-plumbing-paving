import { NextResponse } from 'next/server'
import {
  fetchBuilderSite,
  formatDate,
  resolveBuilderSitemap,
  resolvePublicOrigin,
} from '@/app/lib/siteFiles'

/** Always re-read builder sitemap on each request. */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE = 'no-store, max-age=0, must-revalidate'

function buildXmlFallback(origin: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
}

export async function GET() {
  const origin = resolvePublicOrigin()

  try {
    const site = await fetchBuilderSite()
    const builderSitemap = resolveBuilderSitemap(site, origin)

    if (builderSitemap) {
      return new NextResponse(builderSitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': NO_CACHE,
        },
      })
    }

    console.warn(
      'sitemap.xml: site.files.sitemap missing — serving homepage-only fallback'
    )

    return new NextResponse(buildXmlFallback(origin), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': NO_CACHE,
      },
    })
  } catch (error) {
    console.error('Error generating sitemap.xml:', error)
    return new NextResponse(buildXmlFallback(origin), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': NO_CACHE,
      },
    })
  }
}
