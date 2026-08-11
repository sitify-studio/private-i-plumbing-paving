import { NextResponse } from 'next/server'
import { fetchBuilderSite } from '@/app/lib/siteFiles'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE = 'no-store, max-age=0, must-revalidate'

/** Expose builder legal content (Terms + Privacy) for clients — always fresh. */
export async function GET() {
  try {
    const site = await fetchBuilderSite()
    if (!site) {
      return NextResponse.json(
        { success: false, error: { message: 'Site not found' } },
        { status: 404, headers: { 'Cache-Control': NO_CACHE } }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          legal: site.legal || {},
          files: {
            sitemap: Boolean(site.files?.sitemap),
            robotsTxt: Boolean(site.files?.robotsTxt),
            schemaJson: Boolean(site.files?.schemaJson),
          },
        },
      },
      { headers: { 'Cache-Control': NO_CACHE } }
    )
  } catch (error) {
    console.error('Error fetching legal files:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch legal files' } },
      { status: 500, headers: { 'Cache-Control': NO_CACHE } }
    )
  }
}
