import { resolveBuilderSchema } from '@/app/lib/siteFiles'
import type { Site } from '@/app/lib/types'

/** Inject builder `files.schemaJson` as JSON-LD when present. */
export function BuilderJsonLd({ site }: { site?: Site | null }) {
  const schemas = resolveBuilderSchema(site ?? null)
  if (!schemas?.length) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas) }}
    />
  )
}
