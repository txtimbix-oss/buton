<template>
  <div class="cab-section cab-section--compact">
    <h2 class="sec-title">Выход из аккаунта</h2>
    <div class="cab-card cab-card--clay">
      <p class="security-note">Вы выйдете на всех устройствах, где использовали этот браузер.</p>
      <button class="btn btn--ghost btn--clay" @click="logout">Выйти из аккаунта</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  logout: []
}>()

function logout() {
  emit('logout')
}
</script>
