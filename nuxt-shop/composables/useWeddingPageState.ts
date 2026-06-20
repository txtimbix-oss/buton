import { reactive } from 'vue'

import {
  buildWeddingInquiryPayload,
  createEmptyWeddingInquiryForm,
  validateWeddingContact,
  weddingGallery,
  weddingPageContent,
  weddingPackages,
} from '~/lib/wedding/content'
import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

export interface UseWeddingPageStateDeps {
  submitInquiry: (payload: ReturnType<typeof buildWeddingInquiryPayload>) => Promise<unknown>
  scrollToId?: (id: string) => void
}

export interface UseWeddingPageStateResult {
  pageContent: typeof weddingPageContent
  content: typeof weddingPageContent
  gallery: typeof weddingGallery
  packages: typeof weddingPackages
  form: ReturnType<typeof reactive<ReturnType<typeof createEmptyWeddingInquiryForm>>>
  errors: { name: boolean, phone: boolean }
  loading: ReturnType<typeof useAsyncSubmitState>['loading']
  sent: ReturnType<typeof useAsyncSubmitState>['sent']
  apiError: ReturnType<typeof useAsyncSubmitState>['apiError']
  scrollToForm: () => void
  submit: () => Promise<void>
}

export function useWeddingPageState(
  _options: Record<string, never>,
  deps: UseWeddingPageStateDeps,
): UseWeddingPageStateResult {
  const form = reactive(createEmptyWeddingInquiryForm())
  const errors = reactive({ name: false, phone: false })
  const scrollToId = deps.scrollToId ?? (() => {})
  const submitState = useAsyncSubmitState({
    errorMessage: 'Ошибка отправки. Попробуйте ещё раз.',
  })

  function scrollToForm() {
    scrollToId('wed-form')
  }

  async function submit() {
    Object.assign(errors, validateWeddingContact(form))
    if (errors.name || errors.phone) return

    await submitState.run(async () => {
      await deps.submitInquiry(buildWeddingInquiryPayload(form))
    })
  }

  return {
    pageContent: weddingPageContent,
    content: weddingPageContent,
    gallery: weddingGallery,
    packages: weddingPackages,
    form,
    errors,
    loading: submitState.loading,
    sent: submitState.sent,
    apiError: submitState.apiError,
    scrollToForm,
    submit,
  }
}
