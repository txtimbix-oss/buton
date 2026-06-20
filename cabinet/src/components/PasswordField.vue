<template>
  <label class="field">
    <span>
      {{ label }}
      <span v-if="hint" class="password-field__hint">{{ hint }}</span>
    </span>
    <div class="input-wrap">
      <input
        :value="modelValue"
        class="input"
        :class="inputClass"
        :type="visible ? 'text' : 'password'"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :required="required"
        @input="emitValue"
      />
      <button type="button" class="eye" :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'" @click="visible = !visible">
        <svg v-if="!visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 3.4-.6"/></svg>
      </button>
    </div>
    <PasswordStrengthMeter v-if="showStrength" :password="modelValue" />
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter.vue'

withDefaults(defineProps<{
  modelValue: string
  label: string
  placeholder?: string
  autocomplete?: string
  hint?: string
  minlength?: number
  required?: boolean
  showStrength?: boolean
  inputClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
}>(), {
  placeholder: '••••••••',
  autocomplete: 'current-password',
  hint: '',
  minlength: undefined,
  required: false,
  showStrength: false,
  inputClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)

function emitValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.password-field__hint { font-weight: 400; color: var(--muted); }
</style>
