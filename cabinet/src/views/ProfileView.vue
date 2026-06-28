<template>
  <AppLayout>
    <h1 class="page-title">Профиль</h1>
    <p class="page-sub">Управляйте личными данными и уведомлениями</p>

    <div class="profile-2col">
      <div>
        <ProfileAvatarCard
          :src="avatarSrc"
          :initials="initials"
          :full-name="fullName"
          :tier-name="tierName"
          :avatar-uploading="avatarUploading"
          @select-file="onAvatarSelected"
        />

        <ProfilePersonalForm
          :form="form"
          :saving="saving"
          :success="success"
          :error="error"
          @submit="save"
          @reset="reset"
        />
      </div>

      <div>
        <ProfileNotificationsSection :notifications="notif" @toggle="toggleNotification" />

        <div class="cab-section">
          <CabSectionHeader title="Реферальная программа" />
          <CabReferralCard
            :referral-code="referralCode"
            @copied="handleReferralCopied"
          />
        </div>

        <ProfileAchievementsSection :achievements="achievementsProp" :earned-keys="achEarnedKeys" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabSectionHeader from '@/components/CabSectionHeader.vue'
import CabReferralCard from '@/components/CabReferralCard.vue'
import ProfileAchievementsSection from '@/components/profile/ProfileAchievementsSection.vue'
import ProfileAvatarCard from '@/components/profile/ProfileAvatarCard.vue'
import ProfileNotificationsSection from '@/components/profile/ProfileNotificationsSection.vue'
import ProfilePersonalForm from '@/components/profile/ProfilePersonalForm.vue'
import { useProfileViewModel } from '@/composables/useProfileViewModel'
import { achievementsApi } from '@/api/achievements'
import { computed, onMounted, ref } from 'vue'

const {
  avatarSrc,
  avatarUploading,
  earnedAchievements,
  error,
  form,
  fullName,
  handleReferralCopied,
  initials,
  notif,
  onAvatarSelected,
  referralCode,
  reset,
  save,
  saving,
  success,
  tierName,
  toggleNotification,
} = useProfileViewModel()

/* достижения с бэка: определения + earnedKeys из /api/user/achievements.
   imageUrl с бэка не используем (вёрстка рисует эмодзи) — иконку берём из карты по ключу. */
const ACH_EMOJI: Record<string, string> = {
  first_order: '🛍️', regular: '🌸', generous: '💎', critic: '⭐',
}
const apiAchievements = ref<{ key: string; icon: string; name: string; desc: string }[]>([])
const apiEarnedKeys = ref<string[] | null>(null)
onMounted(async () => {
  try {
    const res = await achievementsApi.get()
    if (Array.isArray(res?.items)) {
      apiAchievements.value = res.items.map(a => ({
        key: a.key,
        icon: ACH_EMOJI[a.key] || '🏆',
        name: a.name,
        desc: a.description,
      }))
    }
    if (Array.isArray(res?.earnedKeys)) apiEarnedKeys.value = res.earnedKeys
  } catch {
    /* fallback: дефолтные определения в компоненте + earnedKeys из профиля */
  }
})
const achievementsProp = computed(() => (apiAchievements.value.length ? apiAchievements.value : undefined))
const achEarnedKeys = computed(() => apiEarnedKeys.value ?? earnedAchievements.value)
</script>
