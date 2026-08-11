import { Metadata } from 'next'
import { generateMetadata as buildMetadata, getSiteSeoData, GOOGLE_SITE_VERIFICATION } from '@/app/lib/metadata'
import { resolveSearchConsoleVerification } from '@/app/lib/integrations'
import { Page, Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import HomeClient from './HomeClient'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG
    if (!siteSlug) {
      return {
        title: 'Web Builder Site',
        description: 'Generated site using Web Builder',
        verification: {
          google: resolveSearchConsoleVerification(null) || GOOGLE_SITE_VERIFICATION,
        },
      }
    }
    const defaultSiteResponse = await api.get(`/public/sites/${siteSlug}`, { silent: true })

    if (defaultSiteResponse && !defaultSiteResponse.error) {
      const site: Site = defaultSiteResponse.data

      const pagesResponse = await api.get(`/public/sites/${site.slug}/pages`, { silent: true })
      
      if (pagesResponse.success && pagesResponse.data) {
        const pages: Page[] = pagesResponse.data
        const homePage = pages.find(p => p.pageType === 'home')
        
        if (homePage) {
          // Use page SEO data, fallback to site SEO data
          const seoData = {
            title: homePage.seo?.title || site.seo?.title,
            description: homePage.seo?.description || site.seo?.description || site.business?.description,
            keywords: homePage.seo?.keywords || site.seo?.keywords,
            ogImageUrl: homePage.seo?.ogImageUrl || site.seo?.ogImageUrl,
            noIndex: homePage.seo?.noIndex || false
          }

          return buildMetadata(seoData, site)
        }
      }
      
      // Fallback: use site SEO data
      return buildMetadata(getSiteSeoData(site), site)
    }
  } catch {
    /* API unreachable — fallback metadata below */
  }
  
  // Fallback metadata
  return {
    title: 'Web Builder Site',
    description: 'Generated site using Web Builder',
    verification: {
      google: resolveSearchConsoleVerification(null) || GOOGLE_SITE_VERIFICATION,
    },
  }
}

export default function Home() {
  return <HomeClient />
}
