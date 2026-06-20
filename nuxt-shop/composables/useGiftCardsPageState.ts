import { computed, reactive, ref } from 'vue'

import {
  buildGiftCardInquiryPayload,
  createEmptyGiftCardForm,
  giftCardDesigns,
  giftCardNominals,
  getGiftCardAmount,
} from '~/lib/gift-cards/content'
import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

export interface UseGiftCardsPageStateDeps {
  submitInquiry: (payload: ReturnType<typeof buildGiftCardInquiryPayload>) => Promise<unknown>
}

export function useGiftCardsPageState(
  _options: Record<string, never>,
  deps: UseGiftCardsPageStateDeps,
) {
  const activeNominal = ref(3)
  const activeDesign = ref(0)
  const customAmount = ref('')
  const form = reactive(createEmptyGiftCardForm())
  const submitState = useAsyncSubmitState({
    errorMessage: 'Ошибка оформления. Попробуйте ещё раз.',
  })

  const currentAmount = computed(() => {
    return getGiftCardAmount(giftCardNominals[activeNominal.value]!, customAmount.value)
  })

  function selectNominal(index: number) {
    activeNominal.value = index
    if (giftCardNominals[index] === 'Своя') customAmount.value = ''
  }

  async function submit() {
    if (!currentAmount.value) {
      submitState.setError('Укажите номинал')
      return
    }

    await submitState.run(async () => {
      await deps.submitInquiry(buildGiftCardInquiryPayload({
        amount: currentAmount.value,
        design: giftCardDesigns[activeDesign.value]!.kind,
        form,
      }))
    })
  }

  return {
    nominals: giftCardNominals,
    designs: giftCardDesigns,
    activeNominal,
    activeDesign,
    customAmount,
    currentAmount,
    form,
    loading: submitState.loading,
    sent: submitState.sent,
    apiError: submitState.apiError,
    selectNominal,
    submit,
  }
}
