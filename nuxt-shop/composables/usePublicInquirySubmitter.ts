import { usePublicBotGuard } from '~/composables/usePublicBotGuard'

type PublicBotGuardBody = ReturnType<ReturnType<typeof usePublicBotGuard>['payload']>

export interface PublicInquirySubmitterDeps<TPayload extends Record<string, unknown>> {
  endpoint?: string
  botGuard?: ReturnType<typeof usePublicBotGuard>
  fetcher?: (
    url: string,
    options: {
      method: 'POST'
      headers: Record<string, string>
      body: TPayload & { _botGuard: PublicBotGuardBody }
    },
  ) => Promise<unknown>
}

export function usePublicInquirySubmitter<TPayload extends Record<string, unknown>>(
  deps: PublicInquirySubmitterDeps<TPayload> = {},
) {
  const botGuard = deps.botGuard ?? usePublicBotGuard()
  const endpoint = deps.endpoint ?? '/api/inquiries'
  const fetcher = deps.fetcher ?? $fetch

  async function submitInquiry(payload: TPayload) {
    return await fetcher(endpoint, {
      method: 'POST',
      headers: botGuard.headers(),
      body: botGuard.withBody(payload),
    })
  }

  return {
    botGuard,
    submitInquiry,
  }
}
