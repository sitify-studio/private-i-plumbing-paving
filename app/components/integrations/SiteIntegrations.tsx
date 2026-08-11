import Script from 'next/script'
import type { Site } from '@/app/lib/types'
import {
  buildGtmNoscript,
  resolveGa4,
  resolveGoogleAdsHtml,
  resolveGoogleMapsHtml,
  resolveGtm,
  resolveSearchConsoleVerification,
  isHtmlSnippet,
  trimIntegration,
} from '@/app/lib/integrations'

type Props = {
  integrations?: Site['integrations'] | null
  seo?: Site['seo'] | null
}

/** Raw admin HTML from Sitify Studio — intentional trusted injection. */
function HtmlSnippet({
  html,
  id,
}: {
  html: string
  id: string
}) {
  if (!html.trim()) return null
  return (
    <div
      id={id}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  )
}

function Ga4ById({ id }: { id: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id={`ga4-${id}`} strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  )
}

function GtmHeadById({ id }: { id: string }) {
  return (
    <Script id={`gtm-head-${id}`} strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${id}');
      `}
    </Script>
  )
}

/**
 * Head / early-body scripts: GTM head, GA4, Ads, Maps, Search Console meta (when raw HTML).
 * Prefer placing near the top of `<body>` if App Router head slot is limited —
 * GTM/GA still work; Search Console token is also set via Metadata API.
 */
export function SiteIntegrationsHead({ integrations, seo }: Props) {
  const gtm = resolveGtm(integrations, seo)
  const ga4 = resolveGa4(integrations, seo)
  const ads = resolveGoogleAdsHtml(integrations)
  const maps = resolveGoogleMapsHtml(integrations)
  const scRaw = trimIntegration(integrations?.searchConsoleVerification)

  return (
    <>
      {/* Search Console: inject full meta HTML when Studio provides a tag */}
      {scRaw && isHtmlSnippet(scRaw) ? (
        <HtmlSnippet html={scRaw} id="sitify-search-console" />
      ) : null}

      {/* GTM head — as high as possible */}
      {gtm.mode === 'snippet' && gtm.headHtml ? (
        <HtmlSnippet html={gtm.headHtml} id="sitify-gtm-head" />
      ) : null}
      {gtm.mode === 'id' ? <GtmHeadById id={gtm.id} /> : null}

      {/* GA4 — skip ID loader when snippet already provided */}
      {ga4.mode === 'snippet' ? (
        <HtmlSnippet html={ga4.html} id="sitify-ga4" />
      ) : null}
      {ga4.mode === 'id' ? <Ga4ById id={ga4.id} /> : null}

      {ads ? <HtmlSnippet html={ads} id="sitify-google-ads" /> : null}
      {maps ? <HtmlSnippet html={maps} id="sitify-google-maps" /> : null}
    </>
  )
}

/**
 * GTM noscript — must be the first child of `<body>` when present.
 */
export function SiteIntegrationsBody({ integrations, seo }: Props) {
  const gtm = resolveGtm(integrations, seo)
  const bodyFromStudio = trimIntegration(integrations?.gtmBody)

  if (bodyFromStudio) {
    return <HtmlSnippet html={bodyFromStudio} id="sitify-gtm-body" />
  }

  if (gtm.mode === 'id') {
    return (
      <HtmlSnippet html={buildGtmNoscript(gtm.id)} id="sitify-gtm-body" />
    )
  }

  if (gtm.mode === 'snippet' && gtm.bodyHtml) {
    return <HtmlSnippet html={gtm.bodyHtml} id="sitify-gtm-body" />
  }

  return null
}

/** @deprecated Use SiteIntegrationsHead — kept for import compatibility. */
export function SiteIntegrations(props: Props) {
  return <SiteIntegrationsHead {...props} />
}

export { resolveSearchConsoleVerification }
