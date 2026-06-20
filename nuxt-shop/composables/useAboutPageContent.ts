import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { buildAboutPageContent } from '~/lib/about/content'
import type { AboutPageContentInput } from '~/lib/about/types'

export function useAboutPageContent(settings: MaybeRefOrGetter<AboutPageContentInput>) {
  const content = computed(() => buildAboutPageContent(toValue(settings)))

  return {
    timeline: computed(() => content.value.timeline),
    team: computed(() => content.value.team),
    values: computed(() => content.value.values),
    howWeChoose: computed(() => content.value.howWeChoose),
    whyUs: computed(() => content.value.whyUs),
  }
}
