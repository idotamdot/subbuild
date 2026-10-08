import { NextResponse } from 'next/server'
import { centralTexasCounties, parseCountyFeatures, type CentralTexasCounty } from '@/lib/central-texas-gis'

export const runtime = 'nodejs'
export const revalidate = 3600

const sourceUrl = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query'

export async function GET(request: Request) {
  const county = new URL(request.url).searchParams.get('county')
  if (!county || !Object.hasOwn(centralTexasCounties, county)) {
    return NextResponse.json({ error: 'Choose a supported Central Texas county to request its public boundary.' }, { status: 400 })
  }
  const fips = centralTexasCounties[county as CentralTexasCounty]
  const url = new URL(sourceUrl)
  url.searchParams.set('where', `GEOID='${fips}'`)
  url.searchParams.set('outFields', 'NAME,GEOID,STATE')
  url.searchParams.set('returnGeometry', 'true')
  url.searchParams.set('outSR', '4326')
  url.searchParams.set('f', 'geojson')

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/geo+json, application/json' },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    })
    if (!response.ok) throw new Error(`Census GIS returned HTTP ${response.status}.`)
    const features = parseCountyFeatures(await response.json() as unknown)
    if (features.length !== 1 || features[0].properties.GEOID !== fips) {
      throw new Error('Census GIS did not return the requested county boundary.')
    }
    return NextResponse.json({
      source: 'U.S. Census Bureau TIGERweb State_County',
      vintage: 'January 1, 2026',
      retrievedAt: new Date().toISOString(),
      sourceUrl: `${sourceUrl}?where=GEOID%3D%27${fips}%27`,
      feature: features[0],
    }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    })
  } catch (error) {
    console.error('County GIS boundary lookup failed:', error)
    return NextResponse.json({ error: 'The live county boundary could not be loaded. Retry later or use the Census source link.' }, { status: 502 })
  }
}
