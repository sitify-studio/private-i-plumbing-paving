import type { Site } from '@/app/lib/types'
import { getSiteOrigin } from '@/app/lib/seo'

/** Resolve public site origin for absolute SEO URLs. */
export function resolvePublicOrigin(): string {
  const fromSeo = getSiteOrigin()
  if (fromSeo) return fromSeo.replace(/\/$/, '')

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '').replace(/^http:\/\//i, 'https://')

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`

  return 'http://localhost:3000'
}

/**
 * Absolute CMS API base for server routes.
 * Prefer the remote API directly — self-proxying `/api` fails when Next binds
 * a different port than getNextAppOrigin() (e.g. 3001 vs 3000).
 */
function getServerApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/api')

  if (!raw || raw.startsWith('/')) {
    // Relative `/api` — resolve against public site URL or Vercel
    const origin = resolvePublicOrigin()
    return `${origin}/api`
  }

  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(raw)
  const withHttps =
    raw.startsWith('http://') && !isLocal ? raw.replace(/^http:\/\//i, 'https://') : raw

  return withHttps.replace(/\/$/, '')
}

function unwrapSitePayload(json: unknown): Site | null {
  if (!json || typeof json !== 'object') return null
  const root = json as Record<string, unknown>
  const data = root.data
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>
    if (nested.data && typeof nested.data === 'object' && 'slug' in (nested.data as object)) {
      return nested.data as unknown as Site
    }
    if ('slug' in nested || 'files' in nested || 'legal' in nested) {
      return data as unknown as Site
    }
  }
  if ('slug' in root || 'files' in root) return root as unknown as Site
  return null
}

/** Fetch the CMS site document (includes legal + files). Always fresh — no cache. */
export async function fetchBuilderSite(): Promise<Site | null> {
  const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG
  if (!siteSlug) return null

  const apiBase = getServerApiBaseUrl()
  const url = `${apiBase}/public/sites/${siteSlug}`

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      console.error(`fetchBuilderSite ${url} → ${res.status}`)
      return null
    }
    const json = await res.json()
    return unwrapSitePayload(json)
  } catch (error) {
    console.error('fetchBuilderSite failed:', error)
    return null
  }
}

/**
 * Prefer builder robots.txt as-is.
 * Only rewrite relative Sitemap paths (e.g. `/sitemap.xml`) to absolute.
 * Absolute Sitemap URLs from the builder are left unchanged.
 */
export function resolveRobotsTxt(site: Site | null, origin: string): string {
  const fallback = `User-agent: *
Disallow:
Sitemap: ${origin}/sitemap.xml`

  const fromBuilder = site?.files?.robotsTxt?.trim()
  let robots = fromBuilder || fallback

  if (/Sitemap:/i.test(robots)) {
    robots = robots.replace(/Sitemap:\s*([^\r\n]+)/i, (_m, loc: string) => {
      const value = String(loc).trim()
      if (/^https?:\/\//i.test(value)) {
        return `Sitemap: ${value}`
      }
      const path = value.startsWith('/') ? value : `/${value}`
      return `Sitemap: ${origin}${path === '/' ? '/sitemap.xml' : path}`
    })
  } else {
    robots = `${robots.replace(/\s*$/, '')}\nSitemap: ${origin}/sitemap.xml`
  }

  return robots
}

/**
 * Prefer builder sitemap XML. Rewrite relative <loc> paths to absolute URLs.
 * Absolute http(s) locs from the builder are left unchanged.
 */
export function resolveBuilderSitemap(site: Site | null, origin: string): string | null {
  const raw = site?.files?.sitemap?.trim()
  if (!raw) return null

  const xml = raw.includes('<?xml')
    ? raw
    : `<?xml version="1.0" encoding="UTF-8"?>\n${raw}`

  return xml.replace(
    /<loc>\s*([^<]+?)\s*<\/loc>/gi,
    (_match, loc: string) => {
      const value = String(loc).trim()
      if (/^https?:\/\//i.test(value)) {
        return `<loc>${value}</loc>`
      }
      const path = value.startsWith('/') ? value : `/${value}`
      const absolute =
        path === '/' ? origin : `${origin}${path}`.replace(/([^:]\/)\/+/g, '$1')
      return `<loc>${absolute}</loc>`
    }
  )
}

/** Prefer builder schema JSON exclusively when present. */
export function resolveBuilderSchema(site: Site | null): unknown[] | null {
  const raw = site?.files?.schemaJson?.trim()
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object') return [parsed]
  } catch {
    console.warn('Invalid site.files.schemaJson from builder')
  }
  return null
}

export function formatDate(value?: string): string {
  if (!value) return new Date().toISOString().split('T')[0]
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? new Date().toISOString().split('T')[0]
    : d.toISOString().split('T')[0]
}
