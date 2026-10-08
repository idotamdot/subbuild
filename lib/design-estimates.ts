export type FinishKey = 'reinforced-concrete' | 'shotcrete' | 'steel' | 'masonry'

type EstimateRate = {
  label: string
  lowPerSquareFoot: number
  highPerSquareFoot: number
  laborLowHoursPerSquareFoot: number
  laborHighHoursPerSquareFoot: number
}

const rates: Record<FinishKey, EstimateRate> = {
  'reinforced-concrete': {
    label: 'Cast-in-place concrete',
    lowPerSquareFoot: 430,
    highPerSquareFoot: 760,
    laborLowHoursPerSquareFoot: 28,
    laborHighHoursPerSquareFoot: 46,
  },
  shotcrete: {
    label: 'Shotcrete finish',
    lowPerSquareFoot: 460,
    highPerSquareFoot: 820,
    laborLowHoursPerSquareFoot: 30,
    laborHighHoursPerSquareFoot: 50,
  },
  steel: {
    label: 'Steel-panel concept',
    lowPerSquareFoot: 510,
    highPerSquareFoot: 940,
    laborLowHoursPerSquareFoot: 24,
    laborHighHoursPerSquareFoot: 42,
  },
  masonry: {
    label: 'Masonry finish concept',
    lowPerSquareFoot: 390,
    highPerSquareFoot: 710,
    laborLowHoursPerSquareFoot: 34,
    laborHighHoursPerSquareFoot: 56,
  },
}

export type DesignEstimate = {
  finish: string
  area: number
  floors: number
  constructionLow: number
  constructionHigh: number
  designFeeLow: number
  designFeeHigh: number
  totalLow: number
  totalHigh: number
  laborLowHours: number
  laborHighHours: number
  designFeePercent: number
}

export function estimateConcept({
  finish,
  lengthFeet,
  widthFeet,
  floors,
}: {
  finish: FinishKey
  lengthFeet: number
  widthFeet: number
  floors: number
}): DesignEstimate {
  const rate = rates[finish]
  const safeLength = Number.isFinite(lengthFeet) ? Math.max(1, Math.round(lengthFeet)) : 1
  const safeWidth = Number.isFinite(widthFeet) ? Math.max(1, Math.round(widthFeet)) : 1
  const safeFloors = Number.isFinite(floors) ? Math.max(1, Math.round(floors)) : 1
  const area = safeLength * safeWidth * safeFloors
  const constructionLow = area * rate.lowPerSquareFoot
  const constructionHigh = area * rate.highPerSquareFoot
  const designFeePercent = 0.15
  const designFeeLow = constructionLow * designFeePercent
  const designFeeHigh = constructionHigh * designFeePercent

  return {
    finish: rate.label,
    area,
    floors: safeFloors,
    constructionLow,
    constructionHigh,
    designFeeLow,
    designFeeHigh,
    totalLow: constructionLow + designFeeLow,
    totalHigh: constructionHigh + designFeeHigh,
    laborLowHours: area * rate.laborLowHoursPerSquareFoot,
    laborHighHours: area * rate.laborHighHoursPerSquareFoot,
    designFeePercent,
  }
}
