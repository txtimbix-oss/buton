<template>
  <Teleport to="body">
    <Transition name="push-slide">
      <div v-if="show" class="push-prompt">
        <div class="push-prompt__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <p class="push-prompt__text">Хотите получать уведомления о статусе заказа и акциях?</p>
        <p v-if="lastError" class="push-prompt__error" role="alert">{{ lastError }}</p>
        <div class="push-prompt__actions">
          <button class="push-prompt__btn push-prompt__btn--yes" :disabled="loading" @click="allow">
            {{ loading ? '…' : 'Да, хочу' }}
          </button>
          <button class="push-prompt__btn push-prompt__btn--no" @click="dismiss">Нет</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { isSupported, permission, subscribe, lastError } = usePush()

const show    = ref(false)
const loading = ref(false)

onMounted(() => {
  // Не показываем если: уже разрешили/запретили, уже закрыли ранее, не поддерживается
  if (!isSupported.value) return
  if (permission.value !== 'default') return
  if (localStorage.getItem('push_dismissed')) return

  // Небольшая задержка — показываем не сразу при входе на страницу
  setTimeout(() => { show.value = true }, 8000)
})

async function allow() {
  loading.value = true
  const ok = await subscribe()
  loading.value = false
  if (ok) {
    show.value = false
    localStorage.setItem('push_dismissed', '1')
  }
}

function dismiss() {
  localStorage.setItem('push_dismissed', '1')
  show.value = false
}
</script>

<style scoped>
.push-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 960;
  background: var(--card);
  border: 1px solid var(--line, #e0d9cc);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(32,48,42,.18);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  max-width: 480px;
  width: calc(100vw - 40px);
}
.push-prompt__icon {
  flex-shrink: 0;
  width: 40px; height: 40px;
  background: var(--paper-2, #EBE2D1);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--green);
}
.push-prompt__text {
  flex: 1;
  font-size: 13.5px;
  line-height: 1.45;
  margin: 0;
  color: var(--ink);
}
.push-prompt__error {
  flex-basis: 100%;
  margin: -4px 0 0 54px;
  color: var(--clay, #ae4848);
  font-size: 12.5px;
  line-height: 1.35;
}
.push-prompt__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.push-prompt__btn {
  border: none;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 7px 14px;
  white-space: nowrap;
  transition: opacity .15s;
}
.push-prompt__btn:disabled { opacity: .6; cursor: default; }
.push-prompt__btn--yes {
  background: var(--green);
  color: #EFE7D2;
}
.push-prompt__btn--yes:hover:not(:disabled) { opacity: .88; }
.push-prompt__btn--no {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--line, #e0d9cc);
}
.push-prompt__btn--no:hover { background: var(--paper-2, #EBE2D1); }

.push-slide-enter-active { transition: all .4s cubic-bezier(.22,1,.36,1); }
.push-slide-leave-active { transition: all .25s ease-in; }
.push-slide-enter-from, .push-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 600px) {
  .push-prompt {
    bottom: 76px; /* над нижней навигацией */
    flex-direction: column;
    text-align: center;
  }
  .push-prompt__actions { flex-direction: row; width: 100%; }
  .push-prompt__btn { flex: 1; }
}
</style>
