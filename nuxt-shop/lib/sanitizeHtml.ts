const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h2', 'h3', 'a'])
const BLOCKED_TAG_RE = /<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
const BLOCKED_SINGLE_TAG_RE = /<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi
const EVENT_ATTR_RE = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const DANGEROUS_URL_RE = /^(javascript|data|vbscript):/i

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function safeHref(attrs: string) {
  const match = attrs.match(/\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const href = (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim()
  if (!href || DANGEROUS_URL_RE.test(href)) return '#'
  if (!/^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i.test(href)) return '#'
  return href
}

export function sanitizeHtml(value: unknown): string {
  const source = String(value ?? '')
    .replace(BLOCKED_TAG_RE, '')
    .replace(BLOCKED_SINGLE_TAG_RE, '')
    .replace(EVENT_ATTR_RE, '')

  return source.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, rawTag, rawAttrs = '') => {
    const tag = String(rawTag).toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    if (match.startsWith('</')) return `</${tag}>`
    if (tag === 'br') return '<br>'
    if (tag === 'a') {
      const href = escapeAttr(safeHref(String(rawAttrs)))
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`
    }
    return `<${tag}>`
  })
}
