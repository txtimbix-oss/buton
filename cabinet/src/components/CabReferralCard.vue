<template>
  <div :class="rootClass">
    <div class="cab-referral-card__inner">
      <div class="cab-referral-card__head">
        <b class="cab-referral-card__title">{{ title }}</b>
      </div>
      <div class="cab-referral-card__body">
        <div class="cab-referral-card__code-wrap">
          <code class="cab-referral-card__code">{{ referralCode || placeholder }}</code>
        </div>
        <div class="cab-referral-card__action">
          <button
            type="button"
            class="btn btn--blush btn--sm cab-referral-card__button"
            @click="copyReferral"
          >
            {{ copied ? copiedButtonLabel : buttonLabel }}
          </button>
        </div>
      </div>
      <p class="cab-referral-card__desc">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReferralLink } from '@/composables/useReferralLink'

interface Props {
  referralCode?: string | null
  rootClass?: string
  title?: string
  description?: string
  buttonLabel?: string
  copiedButtonLabel?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  referralCode: null,
  rootClass: 'cab-card referral-card',
  title: 'Пригласите друга — получите 500 бонусов',
  description: 'Другу — 200 бонусов за первый заказ',
  buttonLabel: 'Копировать ссылку',
  copiedButtonLabel: '✓ Скопировано',
  placeholder: '—',
})

const emit = defineEmits<{
  copied: []
}>()

const { copied, copyReferralLink } = useReferralLink()

async function copyReferral() {
  if (!props.referralCode) return
  await copyReferralLink(props.referralCode)
  emit('copied')
}
</script>

<style scoped>
.cab-referral-card__inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cab-referral-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cab-referral-card__title {
  display: block;
}

.cab-referral-card__body {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cab-referral-card__code-wrap {
  flex: 1 1 220px;
}

.cab-referral-card__action {
  display: flex;
  align-items: center;
}

.cab-referral-card__code {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.cab-referral-card__desc {
  margin: 0;
}
</style>
