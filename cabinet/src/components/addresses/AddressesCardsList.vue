<template>
  <div class="addr-grid2 addr-grid2--list">
    <div v-for="addr in addresses" :key="addr._id" class="addr-card">
      <div class="addr-card__top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
        <span class="addr-card__label">{{ addr.label }}</span>
        <span v-if="addr.isDefault" class="addr-card__def">по умолчанию</span>
      </div>
      <p>{{ addr.address }}</p>
      <div class="addr-card__actions">
        <button @click="emit('edit', addr)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4l4 4L8 20H4v-4L16 4z"/></svg>
          Изменить
        </button>
        <button v-if="!addr.isDefault" class="mk" @click="emit('set-default', addr._id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Сделать основным
        </button>
        <button class="danger" @click="emit('delete', addr._id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IAddress } from '@/types/user-address'

defineProps<{
  addresses: IAddress[]
}>()

const emit = defineEmits<{
  edit: [address: IAddress]
  'set-default': [id: string]
  delete: [id: string]
}>()
</script>
