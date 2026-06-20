<template>
  <div>
    <PasswordField
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :required="required"
      :input-class="{ 'input-error': hasMismatch }"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <p v-if="hasMismatch" class="field-error">Пароли не совпадают</p>
  </div>
</template>

<script setup lang="ts">
import PasswordField from '@/components/PasswordField.vue'
import { usePasswordPolicy } from '@/composables/usePasswordPolicy'

const props = withDefaults(defineProps<{
  modelValue: string
  password: string
  label: string
  placeholder?: string
  autocomplete?: string
  minlength?: number
  required?: boolean
}>(), {
  placeholder: 'Ещё раз',
  autocomplete: 'new-password',
  minlength: undefined,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { hasMismatch } = usePasswordPolicy(() => props.password, () => props.modelValue)
</script>
