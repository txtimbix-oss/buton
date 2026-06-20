import { parseSettingJSON } from '~/lib/settings/normalize'

import type {
  AboutPageContentInput,
  AboutReason,
  AboutStep,
  AboutTeamMember,
  AboutTimelineEvent,
  AboutValueCard,
} from './types'

function parseArraySetting<T>(value: string | undefined): T[] {
  const parsed = parseSettingJSON<T[] | null>(value, [])
  return Array.isArray(parsed) ? parsed : []
}

export function buildAboutPageContent(input: AboutPageContentInput) {
  return {
    timeline: parseArraySetting<AboutTimelineEvent>(input.timeline),
    team: parseArraySetting<AboutTeamMember>(input.team),
    values: parseArraySetting<AboutValueCard>(input.values),
    howWeChoose: parseArraySetting<AboutStep>(input.aboutHowWeChoose),
    whyUs: parseArraySetting<AboutReason>(input.aboutWhyUs),
  }
}
