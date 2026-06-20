<template>
  <svg
    :viewBox="icon.viewBox"
    :fill="icon.fill"
    :stroke="icon.stroke"
    :stroke-width="icon.strokeWidth"
    :stroke-linecap="icon.strokeLinecap as 'round' | 'butt' | 'square' | 'inherit' | undefined"
    :stroke-linejoin="icon.strokeLinejoin as 'round' | 'inherit' | 'miter' | 'bevel' | undefined"
  >
    <template v-for="(shape, shapeIndex) in icon.shapes" :key="shapeIndex">
      <path
        v-if="shape.type === 'path'"
        v-for="(path, pathIndex) in shape.paths"
        :key="`${shapeIndex}-${pathIndex}`"
        v-bind="shape.attrs"
        :d="path.d"
      />
      <template v-else>
        <circle v-bind="shape.attrs" />
        <path
          v-for="(path, pathIndex) in shape.paths"
          :key="`${shapeIndex}-${pathIndex}`"
          :d="path.d"
        />
      </template>
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { CabinetNavIcon } from '@/constants/cabinetNavigation'

defineProps<{
  icon: CabinetNavIcon
}>()
</script>
