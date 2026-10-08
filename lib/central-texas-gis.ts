export const centralTexasCounties = {
  Bastrop: '48021',
  Bell: '48027',
  Burnet: '48053',
  Caldwell: '48055',
  Comal: '48091',
  Gillespie: '48171',
  Hays: '48209',
  McLennan: '48309',
  Travis: '48453',
  Williamson: '48491',
} as const

export type CentralTexasCounty = keyof typeof centralTexasCounties
export type GisPosition = readonly [number, number, ...number[]]
export type GisRing = GisPosition[]
export type CountyGeometry =
  | { type: 'Polygon'; coordinates: GisRing[] }
  | { type: 'MultiPolygon'; coordinates: GisRing[][] }
export type CountyFeature = {
  type: 'Feature'
  properties: { GEOID: string; NAME: string; STATE: string }
  geometry: CountyGeometry
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPosition(value: unknown): value is GisPosition {
  return Array.isArray(value)
    && value.length >= 2
    && typeof value[0] === 'number'
    && Number.isFinite(value[0])
    && typeof value[1] === 'number'
    && Number.isFinite(value[1])
}

function isRing(value: unknown): value is GisRing {
  return Array.isArray(value) && value.length >= 4 && value.every(isPosition)
}

function isPolygonCoordinates(value: unknown): value is GisRing[] {
  return Array.isArray(value) && value.length > 0 && value.every(isRing)
}

function isMultiPolygonCoordinates(value: unknown): value is GisRing[][] {
  return Array.isArray(value) && value.length > 0 && value.every(isPolygonCoordinates)
}

export function parseCountyFeatures(value: unknown): CountyFeature[] {
  if (!isRecord(value) || value.type !== 'FeatureCollection' || !Array.isArray(value.features)) {
    throw new Error('The Census GIS service returned an unsupported map response.')
  }
  return value.features.map((feature): CountyFeature => {
    if (!isRecord(feature) || feature.type !== 'Feature' || !isRecord(feature.properties) || !isRecord(feature.geometry)) {
      throw new Error('The Census GIS service returned an incomplete county feature.')
    }
    const { GEOID, NAME, STATE } = feature.properties
    const { type, coordinates } = feature.geometry
    if (typeof GEOID !== 'string' || typeof NAME !== 'string' || STATE !== '48') {
      throw new Error('The Census GIS service returned invalid county boundary data.')
    }
    if (!Object.values(centralTexasCounties).some((supportedGeoid) => supportedGeoid === GEOID)) {
      throw new Error('The Census GIS service returned a county outside the supported map area.')
    }
    if (type === 'Polygon' && isPolygonCoordinates(coordinates)) {
      return { type: 'Feature', properties: { GEOID, NAME, STATE }, geometry: { type, coordinates } }
    }
    if (type === 'MultiPolygon' && isMultiPolygonCoordinates(coordinates)) {
      return { type: 'Feature', properties: { GEOID, NAME, STATE }, geometry: { type, coordinates } }
    }
    throw new Error('The Census GIS service returned invalid county boundary data.')
  })
}
