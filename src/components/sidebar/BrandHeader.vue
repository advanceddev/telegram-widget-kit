<script setup lang="ts">
import LocaleSwitch from '@/components/sidebar/LocaleSwitch.vue';
</script>

<template>
  <div class="brand">
    <div class="brand-row">
      <h1 class="brand-title">TG Widget Kit</h1>
      <span class="badge">profile 1</span>
    </div>
    <LocaleSwitch class="brand-locale" />
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand-locale {
  align-self: flex-start;
}

.brand-title {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--accent-dim);
  color: #cfefff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
