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

        <ProfileAchievementsSection :earned-keys="earnedAchievements" />
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
</script>
