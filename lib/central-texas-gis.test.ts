import { describe, expect, it } from 'vitest'
import { parseCountyFeatures } from './central-texas-gis'

const validFeature = {
  type: 'Feature',
  properties: { GEOID: '48453', NAME: 'Travis County', STATE: '48' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[-98, 30], [-97, 30], [-97, 31], [-98, 31], [-98, 30]]],
  },
}

describe('Census GIS county feature validation', () => {
  it('accepts a supported Texas county boundary', () => {
    expect(parseCountyFeatures({ type: 'FeatureCollection', features: [validFeature] })).toEqual([validFeature])
  })

  it('rejects unsupported and malformed map features', () => {
    expect(() => parseCountyFeatures({ type: 'FeatureCollection', features: [{ ...validFeature, properties: { ...validFeature.properties, GEOID: '01001', STATE: '01' } }] })).toThrow('outside the supported map area')
    expect(() => parseCountyFeatures({ type: 'FeatureCollection', features: [{ ...validFeature, geometry: { type: 'Polygon', coordinates: [] } }] })).toThrow('invalid county boundary data')
    expect(() => parseCountyFeatures({ type: 'FeatureCollection', features: [{}] })).toThrow('incomplete county feature')
  })
})
