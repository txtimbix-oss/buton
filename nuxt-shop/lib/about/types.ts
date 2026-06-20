export interface AboutTimelineEvent {
  year: string
  text: string
}

export interface AboutTeamMember {
  name: string
  role: string
  bloom: string
  bio: string
}

export interface AboutValueCard {
  icon: string
  title: string
  text: string
}

export interface AboutStep {
  title: string
  text: string
}

export interface AboutReason {
  icon: string
  title: string
  text: string
}

export interface AboutPageContentInput {
  timeline?: string
  team?: string
  values?: string
  aboutHowWeChoose?: string
  aboutWhyUs?: string
}
