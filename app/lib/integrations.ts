import type { Site } from '@/app/lib/types'

export type SiteIntegrations = NonNullable<Site['integrations']>

export type SiteSeoLegacy = Pick<Site['seo'], 'gaId' | 'gtmId'>

/** Last-resort fallbacks when builder + legacy seo are empty (existing template values). */
export const FALLBACK_GA4_ID = 'G-SNQHDE05KP'
export const FALLBACK_SEARCH_CONSOLE_TOKEN =
  'iUoem80N28H3flAJGuDkdcx_h-7bua6uBEgPlOOrhks'

export function trimIntegration(value?: string | null): string {
  return (value || '').trim()
}

export function isHtmlSnippet(value: string): boolean {
  return value.includes('<')
}

/** Extract G-XXXXXXXX from plain ID or HTML snippet. */
export function extractGa4Id(value: string): string | null {
  const match = value.match(/\b(G-[A-Z0-9]+)\b/i)
  return match ? match[1] : null
}

/** Extract GTM-XXXXXXX from plain ID or HTML snippet. */
export function extractGtmId(value: string): string | null {
  const match = value.match(/\b(GTM-[A-Z0-9]+)\b/i)
  return match ? match[1] : null
}

/** Plain verification token, or content="…" from a meta tag. */
export function extractSearchConsoleToken(value: string): string | null {
  if (!value) return null
  if (!isHtmlSnippet(value)) return value
  const match = value.match(/content\s*=\s*["']([^"']+)["']/i)
  return match?.[1]?.trim() || null
}

export type ResolvedGa4 =
  | { mode: 'snippet'; html: string }
  | { mode: 'id'; id: string }
  | { mode: 'none' }

export type ResolvedGtm =
  | { mode: 'snippet'; headHtml: string; bodyHtml?: string }
  | { mode: 'id'; id: string }
  | { mode: 'none' }

/**
 * Resolve GA4: integrations.ga4 → seo.gaId → template fallback.
 * Snippet wins and suppresses ID-based loader for the same product.
 */
export function resolveGa4(
  integrations?: SiteIntegrations | null,
  seo?: SiteSeoLegacy | null
): ResolvedGa4 {
  const fromIntegrations = trimIntegration(integrations?.ga4)
  if (fromIntegrations) {
    if (isHtmlSnippet(fromIntegrations)) {
      return { mode: 'snippet', html: fromIntegrations }
    }
    const id = extractGa4Id(fromIntegrations) || fromIntegrations
    if (id.startsWith('G-')) return { mode: 'id', id }
  }

  const legacy = trimIntegration(seo?.gaId)
  if (legacy) {
    const id = extractGa4Id(legacy) || legacy
    if (id.startsWith('G-')) return { mode: 'id', id }
  }

  if (FALLBACK_GA4_ID) return { mode: 'id', id: FALLBACK_GA4_ID }
  return { mode: 'none' }
}

/**
 * Resolve GTM head: integrations.gtmHead → seo.gtmId.
 * If integrations provide a full head snippet, do not also emit an ID loader.
 */
export function resolveGtm(
  integrations?: SiteIntegrations | null,
  seo?: SiteSeoLegacy | null
): ResolvedGtm {
  const head = trimIntegration(integrations?.gtmHead)
  const body = trimIntegration(integrations?.gtmBody)

  if (head) {
    if (isHtmlSnippet(head)) {
      return { mode: 'snippet', headHtml: head, bodyHtml: body || undefined }
    }
    const id = extractGtmId(head) || head
    if (id.startsWith('GTM-')) {
      return { mode: 'id', id }
    }
  }

  const legacy = trimIntegration(seo?.gtmId)
  if (legacy) {
    const id = extractGtmId(legacy) || legacy
    if (id.startsWith('GTM-')) return { mode: 'id', id }
  }

  // Body-only noscript without head is still useful if Studio sets gtmBody alone
  if (body) {
    return { mode: 'snippet', headHtml: '', bodyHtml: body }
  }

  return { mode: 'none' }
}

export function resolveSearchConsoleVerification(
  integrations?: SiteIntegrations | null
): string | undefined {
  const raw = trimIntegration(integrations?.searchConsoleVerification)
  if (raw) {
    return extractSearchConsoleToken(raw) || undefined
  }
  return FALLBACK_SEARCH_CONSOLE_TOKEN
}

export function resolveGoogleAdsHtml(
  integrations?: SiteIntegrations | null
): string | null {
  const raw = trimIntegration(integrations?.googleAds)
  return raw || null
}

export function resolveGoogleMapsHtml(
  integrations?: SiteIntegrations | null
): string | null {
  const raw = trimIntegration(integrations?.googleMaps)
  return raw || null
}

/** Standard GTM noscript iframe when only an ID is available. */
export function buildGtmNoscript(id: string): string {
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
}
