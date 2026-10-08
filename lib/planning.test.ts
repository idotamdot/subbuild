import { describe, expect, it } from 'vitest'
import { assessPhysicalEnvelope, buildPlanningBrief, getUnresolvedItems, type PlanningDraft } from './planning'

const draft: PlanningDraft = {
  goal: 'Storm shelter',
  occupancy: '3–5 people',
  duration: 'Overnight',
  area: 'Bastrop County',
  projectType: 'Retrofit',
  soilType: 'Unknown',
  accessConstraint: '',
  existingSlab: '',
  ownerPriorities: ['Medical access'],
  feasibility: {
    'Soil & drainage': 'Requires assessment',
    'Site access': 'Known',
    'Utility paths': 'Unsure',
  },
  redactions: { goal: false, occupancy: true, duration: false, area: true, feasibility: false, priorities: false },
}

describe('private planning brief', () => {
  it('redacts selected fields and keeps the shared brief contact-free', () => {
    const brief = buildPlanningBrief(draft)

    expect(brief.goal).toBe('Storm shelter')
    expect(brief.occupancy).toBe('Withheld')
    expect(brief.broadArea).toBe('Withheld')
    expect(brief.unresolvedItems).toEqual(['Soil & drainage', 'Utility paths'])
    expect(brief).not.toHaveProperty('contact')
    expect(brief).not.toHaveProperty('email')
    expect(brief).not.toHaveProperty('phone')
  })

  it('masks feasibility details and unresolved items together', () => {
    const brief = buildPlanningBrief({ ...draft, redactions: { ...draft.redactions, feasibility: true } })

    expect(brief.projectType).toBe('Withheld')
    expect(brief.feasibility).toBe('Withheld')
    expect(brief.unresolvedItems).toBe('Withheld')
  })

  it('lists only feasibility items not marked known', () => {
    expect(getUnresolvedItems(draft).map(([key]) => key)).toEqual(['Soil & drainage', 'Utility paths'])
  })

  it('keeps owner priorities redacted when selected', () => {
    const brief = buildPlanningBrief({
      ...draft,
      redactions: { ...draft.redactions, priorities: true },
    })

    expect(brief.ownerPriorities).toBe('Withheld')
  })

  it('flags below-grade complexity without making a site determination', () => {
    const result = assessPhysicalEnvelope({
      ...draft,
      projectType: 'Retrofit',
      soilType: 'High water table',
      accessConstraint: 'Constrained or zero-lot-line',
      existingSlab: 'Yes',
    })

    expect(result.category).toBe('Potential below-grade fit conflict')
    expect(result.guidance).toContain('Do not treat this as a property decision')
    expect(result.flags).toContain('A high water table can require hydrostatic and drainage engineering.')
  })
})
