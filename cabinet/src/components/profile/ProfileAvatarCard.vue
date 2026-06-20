<template>
  <div class="cab-card profile-head">
    <CabAvatar
      :src="src"
      :initials="initials"
      size="lg"
      clickable
      alt="Аватар"
      @click="triggerUpload"
    >
      <template #overlay>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </template>
    </CabAvatar>
    <div class="profile-head__body">
      <div class="profile-name">{{ fullName }}</div>
      <span class="tier-tag profile-tier">{{ tierName }}</span>
      <div class="profile-head__actions">
        <button class="btn btn--ghost btn--sm btn--tight" @click="triggerUpload">
          <span v-if="!avatarUploading">Изменить фото</span>
          <span v-else>Загружаем…</span>
        </button>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden-input"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CabAvatar from '@/components/CabAvatar.vue'

defineProps<{
  src: string | null
  initials: string
  fullName: string
  tierName: string
  avatarUploading: boolean
}>()

const emit = defineEmits<{
  (e: 'select-file', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) emit('select-file', file)
  target.value = ''
}
</script>
