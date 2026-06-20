import { reactive } from 'vue'

import {
  buildCorporateInquiryPayload,
  corporateBenefits,
  corporateFormats,
  validateCorporateContact,
  type CorporateInquiryForm,
} from '~/lib/corporate/content'
import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

export interface UseCorporatePageStateDeps {
  submitInquiry: (payload: ReturnType<typeof buildCorporateInquiryPayload>) => Promise<unknown>
}

export function useCorporatePageState(
  _options: Record<string, never>,
  deps: UseCorporatePageStateDeps,
) {
  const form = reactive<CorporateInquiryForm>({
    company: '',
    inn: '',
    volume: 'от 30 000 ₽/мес',
    frequency: 'Еженедельно',
    name: '',
    phone: '',
  })
  const errors = reactive({ name: false, phone: false })
  const submitState = useAsyncSubmitState({
    errorMessage: 'Ошибка отправки. Попробуйте ещё раз.',
  })

  async function submit() {
    Object.assign(errors, validateCorporateContact(form))
    if (errors.name || errors.phone) return

    await submitState.run(async () => {
      await deps.submitInquiry(buildCorporateInquiryPayload(form))
    })
  }

  return {
    benefits: corporateBenefits,
    formats: corporateFormats,
    form,
    errors,
    loading: submitState.loading,
    sent: submitState.sent,
    apiError: submitState.apiError,
    submit,
  }
}
