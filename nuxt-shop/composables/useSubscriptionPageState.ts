import { nextTick, reactive, ref } from 'vue'
import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

import {
  createEmptySubscriptionForm,
  buildSubscriptionPayload,
  subscriptionPlans,
  subscriptionReviews,
  subscriptionSteps,
  subscriptionTimeOptions,
  subscriptionWeekDays,
} from '~/lib/subscription/content'
import type { SubscriptionForm, SubscriptionPlan } from '~/lib/subscription/types'

export interface UseSubscriptionPageStateDeps {
  submitSubscription: (payload: SubscriptionForm & { plan: string }) => Promise<unknown>
  nextTick?: () => Promise<unknown>
}

export function useSubscriptionPageState(
  _options: Record<string, never>,
  deps: UseSubscriptionPageStateDeps,
) {
  const selectedPlan = ref<SubscriptionPlan | null>(null)
  const formRef = ref<HTMLElement | null>(null)
  const subForm = reactive(createEmptySubscriptionForm())
  const submitState = useAsyncSubmitState({
    errorMessage: 'Не удалось отправить заявку. Проверьте соединение и попробуйте снова.',
  })
  const nextTickFn = deps.nextTick ?? (() => nextTick())

  async function selectPlan(plan: SubscriptionPlan) {
    selectedPlan.value = plan
    await nextTickFn()
    formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function submit() {
    if (!selectedPlan.value) return

    await submitState.run(async () => {
      await deps.submitSubscription(
        buildSubscriptionPayload(subForm, selectedPlan.value.title),
      )
      selectedPlan.value = null
      Object.assign(subForm, createEmptySubscriptionForm())
    })
  }

  return {
    steps: subscriptionSteps,
    plans: subscriptionPlans,
    weekDays: subscriptionWeekDays,
    timeOptions: subscriptionTimeOptions,
    reviews: subscriptionReviews,
    selectedPlan,
    formRef,
    subForm,
    subSubmitting: submitState.loading,
    subSuccess: submitState.sent,
    subError: submitState.apiError,
    selectPlan,
    submit,
  }
}
