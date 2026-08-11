import { NextResponse } from 'next/server'
import {
  fetchBuilderSite,
  resolvePublicOrigin,
  resolveRobotsTxt,
} from '@/app/lib/siteFiles'

/** Always re-read builder robots.txt on each request. */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE = 'no-store, max-age=0, must-revalidate'

export async function GET() {
  const origin = resolvePublicOrigin()

  try {
    const site = await fetchBuilderSite()
    const robotsTxt = resolveRobotsTxt(site, origin)

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': NO_CACHE,
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    return new NextResponse(resolveRobotsTxt(null, origin), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': NO_CACHE,
      },
    })
  }
}
