<template>
  <div v-if="password" class="pw-strength">
    <div class="pw-strength__bar">
      <progress class="pw-strength__fill" :class="strength.state" :value="strength.pct" max="100"></progress>
    </div>
    <div class="pw-strength__lbl" :class="strength.state">{{ strength.label }}</div>
  </div>
</template>

<script setup lang="ts">
import { usePasswordPolicy } from '@/composables/usePasswordPolicy'

const props = defineProps<{
  password: string
}>()

const { strength } = usePasswordPolicy(() => props.password)
</script>

<style scoped>
.pw-strength { margin-top: 8px; }
.pw-strength__bar { height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
.pw-strength__fill {
  width: 100%;
  height: 100%;
  display: block;
  appearance: none;
  border: 0;
  background: transparent;
  border-radius: 3px;
}

.pw-strength__fill::-webkit-progress-bar { background: transparent; }
.pw-strength__fill.weak::-webkit-progress-value { background: var(--clay); border-radius: 3px; }
.pw-strength__fill.mid::-webkit-progress-value { background: #B7791F; border-radius: 3px; }
.pw-strength__fill.good::-webkit-progress-value { background: var(--green); border-radius: 3px; }
.pw-strength__fill.weak::-moz-progress-bar { background: var(--clay); border-radius: 3px; }
.pw-strength__fill.mid::-moz-progress-bar { background: #B7791F; border-radius: 3px; }
.pw-strength__fill.good::-moz-progress-bar { background: var(--green); border-radius: 3px; }
.pw-strength__lbl { font-size: 12px; margin-top: 5px; font-weight: 600; }
.pw-strength__lbl.weak { color: var(--clay); }
.pw-strength__lbl.mid { color: #B7791F; }
.pw-strength__lbl.good { color: var(--green); }
</style>
