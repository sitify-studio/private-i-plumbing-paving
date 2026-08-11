import { NextResponse } from 'next/server'
import { getImageSrc } from '@/app/lib/utils'
import {
  fetchBuilderSite,
  resolveBuilderSchema,
  resolvePublicOrigin,
} from '@/app/lib/siteFiles'

/** Always re-read builder schema on each request. */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE = 'no-store, max-age=0, must-revalidate'

export async function GET() {
  const origin = resolvePublicOrigin()

  try {
    const site = await fetchBuilderSite()

    const builderSchema = resolveBuilderSchema(site)
    if (builderSchema) {
      return NextResponse.json(builderSchema, {
        headers: {
          'Content-Type': 'application/ld+json; charset=utf-8',
          'Cache-Control': NO_CACHE,
        },
      })
    }

    const schemaJson: Record<string, unknown>[] = []

    if (site?.business?.name) {
      const logoSrc = getImageSrc(site.theme?.logoUrl)
      const logoUrl = logoSrc
        ? /^https?:\/\//i.test(logoSrc)
          ? logoSrc
          : `${origin}${logoSrc.startsWith('/') ? '' : '/'}${logoSrc}`
        : undefined

      schemaJson.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: site.business.name,
        url: origin,
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(site.business.email || site.business.phone
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: site.business.phone || undefined,
                contactType: 'customer service',
                email: site.business.email || undefined,
              },
            }
          : {}),
        ...(site.business.address
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: site.business.address.street,
                addressLocality: site.business.address.city,
                addressRegion: site.business.address.state,
                postalCode: site.business.address.zipCode,
                addressCountry: site.business.address.country || 'US',
              },
            }
          : {}),
        ...(site.socialLinks?.length
          ? { sameAs: site.socialLinks.map((link) => link.url) }
          : {}),
      })
    }

    schemaJson.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site?.name || site?.business?.name || 'Web Builder Site',
      url: origin,
      ...(site?.seo?.description ? { description: site.seo.description } : {}),
    })

    return NextResponse.json(schemaJson, {
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8',
        'Cache-Control': NO_CACHE,
      },
    })
  } catch (error) {
    console.error('Error generating schema.json:', error)
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8',
        'Cache-Control': NO_CACHE,
      },
    })
  }
}
