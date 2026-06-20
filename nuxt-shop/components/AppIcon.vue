<template>
  <svg class="icon" viewBox="0 0 24 24">
    <path :d="paths[name]" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{ name: string }>()

const paths: Record<string, string> = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  user:   'M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  login:  'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
  heart:  'M12 20S3.5 14.5 3.5 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8.5 2.8C20.5 14.5 12 20 12 20z',
  bag:    'M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2',
  pin:    'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock:  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  leaf:   'M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19c3-3 6-5 9-6',
  truck:  'M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  gift:   'M4 11h16v9H4zM4 7h16v4H4zM12 7v13M12 7S10.5 3 8.5 4S10 7 12 7zM12 7s1.5-4 3.5-3S14 7 12 7z',
}
</script>
