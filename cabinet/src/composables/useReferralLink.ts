import { ref } from 'vue'

export function useReferralLink() {
  const copied = ref(false)

  async function copyReferralLink(code?: string | null) {
    if (!code) return
    const url = `${window.location.origin}/register?ref=${code}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {}
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  return {
    copied,
    copyReferralLink,
  }
}
