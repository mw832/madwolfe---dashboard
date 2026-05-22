import type { Role } from './types'

export const PERMISSIONS = {
  admin: {
    tabs: ['overview', 'productions', 'goals', 'mytasks', 'teamtasks', 'finances', 'team', 'news'],
    canEditProductions: true,
    canEditGoals: true,
    canEditFinances: true,
    canAssignTasks: true,
    canSeeCompanyFinances: true,
    canSeeLegal: true,
    canSeeTeamComp: true,
    canEditFestivals: true,
    canEditDistribution: true,
    canEditMarketing: true,
  },
  kaleigh: {
    tabs: ['overview', 'productions', 'goals', 'mytasks', 'news'],
    canEditProductions: false,
    canEditGoals: false,
    canEditFinances: false,
    canAssignTasks: false,
    canSeeCompanyFinances: false,
    canSeeLegal: false,
    canSeeTeamComp: false,
    canEditFestivals: true,
    canEditDistribution: true,
    canEditMarketing: true,
  },
  grecia: {
    tabs: ['overview', 'productions', 'goals', 'mytasks', 'news'],
    canEditProductions: false,
    canEditGoals: false,
    canEditFinances: false,
    canAssignTasks: false,
    canSeeCompanyFinances: false,
    canSeeLegal: false,
    canSeeTeamComp: false,
    canEditFestivals: false,
    canEditDistribution: false,
    canEditMarketing: false,
  },
  meghan: {
    tabs: ['overview', 'productions', 'goals', 'mytasks', 'news'],
    canEditProductions: false,
    canEditGoals: false,
    canEditFinances: false,
    canAssignTasks: false,
    canSeeCompanyFinances: false,
    canSeeLegal: false,
    canSeeTeamComp: false,
    canEditFestivals: false,
    canEditDistribution: false,
    canEditMarketing: false,
  },
}

export function can(role: Role, permission: keyof typeof PERMISSIONS['admin']) {
  return PERMISSIONS[role]?.[permission] ?? false
}

export function getTabs(role: Role) {
  return (PERMISSIONS[role]?.tabs ?? []) as string[]
}
