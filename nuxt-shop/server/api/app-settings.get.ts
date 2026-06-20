export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const rawSettings = await $fetch<unknown>(`${config.apiBase}/api/settings`).catch(() => ({}))
  const remote = rawSettings && typeof rawSettings === 'object' && !Array.isArray(rawSettings)
    ? rawSettings as Record<string, string>
    : {}

  return {
    ...remote,
    siteUrl: (config.public.siteUrl as string) || remote.siteUrl || '',
  }
})
