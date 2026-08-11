import type { Metadata } from 'next'
import { Page, Site, Service, BlogPost, ServiceAreaPage } from './types'
import { getSiteOrigin } from './seo'
import { getImageSrc } from './utils'
import { resolveSearchConsoleVerification } from './integrations'

interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  ogImageUrl?: string
  noIndex?: boolean
}

/** Same-origin proxy — avoids default app/favicon.ico winning over CMS webp. */
export const SITE_ICON_PATH = '/site-icon'

/** @deprecated Prefer resolveSearchConsoleVerification(site.integrations) */
export const GOOGLE_SITE_VERIFICATION = 'iUoem80N28H3flAJGuDkdcx_h-7bua6uBEgPlOOrhks'

/** Resolve CMS favicon (falls back to logo so tabs never look empty). */
export function resolveSiteFavicon(site?: Site | null): string | undefined {
  if (!site) return undefined
  const fromSeo = getImageSrc(site.seo?.faviconUrl)
  if (fromSeo) return fromSeo
  const fromLogo = getImageSrc(site.theme?.logoUrl)
  return fromLogo || undefined
}

function iconMimeFromUrl(url: string): string {
  const path = url.split('?')[0]?.toLowerCase() ?? ''
  if (path.endsWith('.svg')) return 'image/svg+xml'
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.ico')) return 'image/x-icon'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.gif')) return 'image/gif'
  return 'image/png'
}

function withSiteIcons(metadata: Metadata, site?: Site | null): Metadata {
  const favicon = resolveSiteFavicon(site)
  if (!favicon) return metadata

  const origin = getSiteOrigin()
  const type = iconMimeFromUrl(favicon)

  return {
    ...metadata,
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    icons: {
      icon: [{ url: SITE_ICON_PATH, type }],
      shortcut: [{ url: SITE_ICON_PATH, type }],
      apple: [{ url: SITE_ICON_PATH, type }],
    },
  }
}

export function generateMetadata(seoData: SEOData, site?: Site): Metadata {
  const { title, description, keywords, ogImageUrl, noIndex } = seoData
  
  // Use site name as fallback and for title suffix
  const siteName = site?.business?.name || site?.name || 'Web Builder Site'
  const finalTitle = title ? `${title} | ${siteName}` : siteName
  
  const searchConsole =
    resolveSearchConsoleVerification(site?.integrations) || GOOGLE_SITE_VERIFICATION

  const metadata: Metadata = {
    title: finalTitle,
    description: description || site?.business?.description || 'Generated site using Web Builder',
    keywords: keywords?.join(', ') || site?.seo?.keywords?.join(', '),
    verification: {
      google: searchConsole,
    },
  }

  // Add Open Graph metadata
  if (ogImageUrl || site?.seo?.ogImageUrl) {
    metadata.openGraph = {
      title: finalTitle,
      description: description || site?.business?.description || 'Generated site using Web Builder',
      images: [
        {
          url: ogImageUrl || site?.seo?.ogImageUrl || '',
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    }
  }

  // Add robots meta tag for no-index
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    }
  }

  return withSiteIcons(metadata, site)
}

export function getPageSeoData(page: Page | ServiceAreaPage): SEOData {
  return {
    title: page.seo?.title,
    description: page.seo?.description,
    keywords: page.seo?.keywords,
    ogImageUrl: page.seo?.ogImageUrl,
    noIndex: page.seo?.noIndex,
  }
}

export function getServiceSeoData(service: Service): SEOData {
  return {
    title: service.seo?.title || service.name,
    description: service.seo?.description,
    keywords: service.seo?.keywords,
    ogImageUrl: service.seo?.ogImageUrl,
    noIndex: false, // Services don't have noIndex in their schema
  }
}

export function getBlogPostSeoData(blogPost: BlogPost): SEOData {
  return {
    title: blogPost.seo?.title || blogPost.title,
    description: blogPost.seo?.description || blogPost.excerpt,
    keywords: blogPost.seo?.keywords,
    ogImageUrl: blogPost.seo?.ogImageUrl || blogPost.featuredImage?.url,
    noIndex: false, // Blog posts don't have noIndex in their schema
  }
}

export function getSiteSeoData(site: Site): SEOData {
  return {
    title: site.seo?.title,
    description: site.seo?.description,
    keywords: site.seo?.keywords,
    ogImageUrl: site.seo?.ogImageUrl,
    noIndex: false, // Sites don't have noIndex in their schema
  }
}
