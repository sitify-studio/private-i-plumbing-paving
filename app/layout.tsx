import type { Metadata } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { LenisProvider } from '@/app/components/cinematic/LenisProvider'
import { AmbientFoundation } from '@/app/components/cinematic/AmbientFoundation'
import { HeroIntroProvider } from '@/app/providers/HeroIntroProvider'
import { Header } from '@/app/components/layout/Header'
import {
  SiteIntegrationsBody,
  SiteIntegrationsHead,
} from '@/app/components/integrations/SiteIntegrations'
import { BuilderJsonLd } from '@/app/components/seo/BuilderJsonLd'
import { fetchInitialSiteData } from '@/app/lib/serverSiteData'
import {
  generateMetadata as buildMetadata,
  getSiteSeoData,
  GOOGLE_SITE_VERIFICATION,
} from '@/app/lib/metadata'
import { resolveSearchConsoleVerification } from '@/app/lib/integrations'

export async function generateMetadata(): Promise<Metadata> {
  const initialData = await fetchInitialSiteData()
  if (!initialData?.site) {
    return {
      title: 'Web Builder Site',
      description: 'Generated site using Web Builder',
      verification: {
        google:
          resolveSearchConsoleVerification(null) || GOOGLE_SITE_VERIFICATION,
      },
    }
  }
  return buildMetadata(getSiteSeoData(initialData.site), initialData.site)
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialData = await fetchInitialSiteData()
  const site = initialData?.site

  return (
    <html lang="en">
      <head>
        <SiteIntegrationsHead integrations={site?.integrations} seo={site?.seo} />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <SiteIntegrationsBody integrations={site?.integrations} seo={site?.seo} />
        <BuilderJsonLd site={site} />
        <ErrorBoundary>
          <WebBuilderProvider initialData={initialData}>
            <LanguageProvider>
              <LenisProvider>
                <AmbientFoundation />
                <HeroIntroProvider>
                  <ThemeFontWrapper>
                    <Header />
                    <main className="relative z-10 min-h-screen pt-[var(--wb-header-height)]">
                      {children}
                    </main>
                  </ThemeFontWrapper>
                </HeroIntroProvider>
              </LenisProvider>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
