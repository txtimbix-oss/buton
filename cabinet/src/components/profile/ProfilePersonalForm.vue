<template>
  <div class="cab-card">
    <h3 class="profile-section-title">Личные данные</h3>

    <div v-if="success" class="alert alert--success alert--mb">{{ success }}</div>
    <div v-if="error" class="alert alert--error alert--mb">{{ error }}</div>

    <form @submit.prevent="emit('submit')">
      <div class="row-2">
        <label class="field"><span>Имя *</span><input v-model="form.firstName" class="input" type="text" required /></label>
        <label class="field"><span>Фамилия *</span><input v-model="form.lastName" class="input" type="text" required /></label>
      </div>
      <label class="field">
        <span>Email</span>
        <input v-model="form.email" class="input" type="email" required />
      </label>
      <div class="row-2">
        <label class="field"><span>Телефон</span><input v-model="form.phone" class="input" type="tel" placeholder="+7 (999) 123-45-67" /></label>
        <label class="field"><span>Дата рождения</span><AppDatePicker v-model="form.birthDate" placeholder="Выберите дату" :block-future="true" /></label>
      </div>
      <label class="field">
        <span>Пол</span>
        <select v-model="form.gender" class="input select">
          <option value="">Не указан</option>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
          <option value="other">Другой</option>
        </select>
      </label>
      <div class="profile-form-actions">
        <button class="btn btn--primary btn--stretch" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner spinner--sm"></span>
          <span v-else>Сохранить изменения</span>
        </button>
        <button class="btn btn--ghost btn--stretch" type="button" @click="emit('reset')">Отмена</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import AppDatePicker from '@/components/AppDatePicker.vue'
import type { ProfileForm } from '@/components/profile/types'

defineProps<{
  form: ProfileForm
  saving: boolean
  success: string
  error: string
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'reset'): void
}>()
</script>
