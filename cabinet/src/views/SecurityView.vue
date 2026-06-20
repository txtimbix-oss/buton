<template>
  <AppLayout>
    <h1 class="page-title">Безопасность</h1>
    <p class="page-sub">Управляйте паролем и сессиями</p>

    <SecurityPasswordSection v-model:form="form" :saving="saving" :success="success" :error="error" @submit="save" />
    <SecurityLogoutBlock @logout="logout" />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import SecurityLogoutBlock from '@/components/security/SecurityLogoutBlock.vue'
import SecurityPasswordSection from '@/components/security/SecurityPasswordSection.vue'
import { useSecurityViewModel } from '@/composables/useSecurityViewModel'

const {
  error,
  form,
  logout,
  save,
  saving,
  success,
} = useSecurityViewModel()
</script>
