export type FeasibilityAnswer = 'Known' | 'Unsure' | 'Requires assessment'

export type PlanningDraft = {
  goal: string
  occupancy: string
  duration: string
  area: string
  projectType: string
  soilType: string
  accessConstraint: string
  existingSlab: string
  ownerPriorities: string[]
  feasibility: Record<string, FeasibilityAnswer>
  redactions: Record<string, boolean>
}

export const feasibilityItems = [
  ['Soil & drainage', 'Soil conditions and water management'],
  ['Site access', 'Equipment access and excavation limits'],
  ['Utility paths', 'Known utility locations and service routes'],
  ['Mobility & permits', 'Accessibility goals and local review needs'],
] as const

export function getUnresolvedItems(draft: PlanningDraft) {
  return feasibilityItems.filter(([key]) => draft.feasibility[key] && draft.feasibility[key] !== 'Known')
}

export function assessPhysicalEnvelope(draft: PlanningDraft) {
  const flags: string[] = []
  if (!draft.soilType || draft.soilType === 'Unknown') flags.push('Soil and groundwater conditions have not been assessed.')
  if (draft.soilType === 'Expansive clay') flags.push('Expansive clay can require project-specific movement and foundation engineering.')
  if (draft.soilType === 'Shallow bedrock or chalk') flags.push('Shallow bedrock or chalk can require specialized excavation design.')
  if (draft.soilType === 'High water table') flags.push('A high water table can require hydrostatic and drainage engineering.')
  if (draft.accessConstraint === 'Constrained or zero-lot-line') flags.push('Constrained access can change excavation equipment and construction logistics.')
  if (draft.accessConstraint === 'Crane or restricted equipment access') flags.push('Crane or restricted equipment access needs a site-specific logistics review.')
  if (draft.projectType === 'Retrofit' && draft.existingSlab === 'Yes') flags.push('Cutting an existing slab requires structural and utility review before any below-grade concept is considered.')

  const retrofitConflict = draft.projectType === 'Retrofit'
    && draft.existingSlab === 'Yes'
    && draft.accessConstraint === 'Constrained or zero-lot-line'
  if (retrofitConflict) {
    return {
      category: 'Potential below-grade fit conflict',
      flags,
      guidance: 'This combination may make below-grade construction impractical. Do not treat this as a property decision; discuss above-ground safe-room alternatives with a qualified designer.',
    }
  }
  if (flags.length > 0) {
    return {
      category: 'Complex engineering review',
      flags,
      guidance: 'These conditions can require specialized engineering or construction methods. A site assessment is needed before comparing concepts.',
    }
  }
  if (draft.projectType === 'New build' && draft.soilType && draft.accessConstraint === 'Conventional equipment access') {
    return {
      category: 'Standard-methods screening candidate',
      flags: [],
      guidance: 'No complexity trigger was selected. This is not an engineering approval, buildability finding, or code determination.',
    }
  }
  return {
    category: 'More information needed',
    flags: ['Project type, soil, and access details are incomplete.'],
    guidance: 'An unanswered item is not a disqualification. Site review is required before any feasibility conclusion.',
  }
}

export function comparePriorities(owner: string[], coReviewer: string[]) {
  return {
    shared: owner.filter((priority) => coReviewer.includes(priority)),
    ownerOnly: owner.filter((priority) => !coReviewer.includes(priority)),
    coReviewerOnly: coReviewer.filter((priority) => !owner.includes(priority)),
  }
}

export function buildPrivateBrief(draft: PlanningDraft) {
  const maskFeasibility = draft.redactions.feasibility
  const envelope = assessPhysicalEnvelope(draft)
  return {
    title: 'Private shelter planning brief',
    version: 'Guidance rules 1.0',
    preparedOn: new Date().toISOString().slice(0, 10),
    notice: 'Planning guidance only. Not an engineered recommendation, permit, or safety approval.',
    goal: draft.redactions.goal ? 'Withheld' : draft.goal,
    projectType: maskFeasibility ? 'Withheld' : draft.projectType,
    occupancy: draft.redactions.occupancy ? 'Withheld' : draft.occupancy,
    targetDuration: draft.redactions.duration ? 'Withheld' : draft.duration,
    broadArea: draft.redactions.area ? 'Withheld' : draft.area,
    feasibility: maskFeasibility ? 'Withheld' : draft.feasibility,
    unresolvedItems: maskFeasibility ? 'Withheld' : getUnresolvedItems(draft).map(([key]) => key),
    physicalEnvelope: maskFeasibility ? 'Withheld' : envelope,
    ownerPriorities: draft.redactions.priorities ? 'Withheld' : draft.ownerPriorities,
  }
}
