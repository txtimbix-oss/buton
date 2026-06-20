<template>
  <Teleport to="body">
    <!-- Панель чата -->
    <Transition name="chat-rise">
      <div v-if="isOpen" class="chat-box">
        <div class="chat-box__head">
          <span class="chat-box__title">Чат с поддержкой</span>
          <button class="chat-box__close chat-iconbtn" aria-label="Закрыть" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <ChatOfflineForm
          v-if="showOfflineForm"
          :name="offlineName"
          :email="offlineEmail"
          :message="offlineMsg"
          :sending="offlineSending"
          :sent="offlineSent"
          :error="offlineError"
          :submit-disabled="offlineSubmitDisabled"
          @update:name="offlineName = $event"
          @update:email="offlineEmail = $event"
          @update:message="offlineMsg = $event"
          @submit="submitOffline"
        />

        <template v-else>
          <ChatMessages
            :messages="messages"
            :is-connected="isConnected"
            :admin-typing="adminTyping"
            :is-closed="isClosed"
            :rated="rated"
            :hover-rating="hoverRating"
            @update:hover-rating="hoverRating = $event"
            @rate="rateChat"
          />

          <ChatComposer
            :input-text="inputText"
            :pending-files="pendingFiles"
            :sending="sending"
            :is-closed="isClosed"
            :is-recording="isRecording"
            :error="composerError || lastError"
            @update:input-text="inputText = $event"
            @file-change="onFileChange"
            @remove-pending="removePending"
            @toggle-recording="toggleRecording"
            @submit="submit"
            @input="onInput"
          />
        </template>
      </div>
    </Transition>

    <!-- Кнопка-пузырь -->
    <button
      class="chat"
      :class="{ 'chat--open': isOpen }"
      aria-label="Открыть чат"
      @click="toggle"
    >
      <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span v-if="unread > 0 && !isOpen" class="chat-badge">{{ unread > 9 ? '9+' : unread }}</span>
    </button>
  </Teleport>
</template>

<script setup lang="ts">
import { useChatWidget } from '@/composables/useChatWidget'
import ChatComposer from '@/components/chat/ChatComposer.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import ChatOfflineForm from '@/components/chat/ChatOfflineForm.vue'

const {
  messages,
  isOpen,
  unread,
  isConnected,
  adminTyping,
  isClosed,
  lastError,
  close,
  rated,
  hoverRating,
  rateChat,
  toggle,
  showOfflineForm,
  offlineName,
  offlineEmail,
  offlineMsg,
  offlineSending,
  offlineSent,
  offlineError,
  offlineSubmitDisabled,
  submitOffline,
  inputText,
  pendingFiles,
  sending,
  isRecording,
  composerError,
  submit,
  onFileChange,
  removePending,
  toggleRecording,
  onInput,
} = useChatWidget()
</script>
