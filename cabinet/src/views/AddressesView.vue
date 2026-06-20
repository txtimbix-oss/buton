<template>
  <AppLayout>
    <h1 class="page-title">Адреса доставки</h1>
    <p class="page-sub">Сохранённые адреса подставляются при оформлении заказа</p>

    <div v-if="!user" class="content-loading"><span class="spinner"></span></div>

    <CabEmptyState
      v-else-if="!addresses.length"
      title="Нет сохранённых адресов"
      text="Добавьте адрес — и при следующем заказе форма заполнится автоматически"
    >
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
      </template>
      <template #action>
        <button class="btn btn--ghost" @click="openModal()">Добавить первый адрес</button>
      </template>
    </CabEmptyState>

    <template v-else>
      <AddressesCardsList
        :addresses="addresses"
        @edit="openModal"
        @set-default="setDefault"
        @delete="requestDelete"
      />
      <button class="btn btn--ghost btn--block" @click="openModal()">+ Добавить новый адрес</button>
    </template>

    <AddressFormModal
      v-model="form"
      :open="modal"
      :title="editId ? 'Изменить адрес' : 'Новый адрес'"
      :submit-label="editId ? 'Сохранить' : 'Добавить'"
      :saving="saving"
      :error="modalError"
      @close="closeModal"
      @submit="save"
    />

    <CabConfirmDialog
      :open="!!deleteId"
      icon="🗑️"
      title="Удалить адрес?"
      text="Адрес исчезнет из сохранённых и больше не будет подставляться при оформлении заказа."
      confirm-label="Удалить"
      @cancel="cancelDelete"
      @confirm="confirmRemove"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabConfirmDialog from '@/components/CabConfirmDialog.vue'
import CabEmptyState from '@/components/CabEmptyState.vue'
import AddressFormModal from '@/components/addresses/AddressFormModal.vue'
import AddressesCardsList from '@/components/addresses/AddressesCardsList.vue'
import { useAddressesViewModel } from '@/composables/useAddressesViewModel'

const {
  addresses,
  cancelDelete,
  closeModal,
  confirmRemove,
  deleteId,
  editId,
  form,
  modal,
  modalError,
  openModal,
  requestDelete,
  save,
  saving,
  setDefault,
  user,
} = useAddressesViewModel()
</script>
