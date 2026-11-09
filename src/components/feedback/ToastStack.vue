<script setup lang="ts">
import { useNotifications } from '@/composables/use-notifications';

const { notices, dismiss } = useNotifications();
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="toast"
          :class="`toast--${notice.kind}`"
          @click="dismiss(notice.id)"
        >
          {{ notice.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  cursor: pointer;
  max-width: 420px;
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--text);
  background: var(--panel-3);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-overlay);
}

.toast--error {
  border-color: rgba(229, 57, 53, 0.55);
  background: rgba(46, 16, 18, 0.92);
  color: #ffc9c5;
}

.toast--success {
  border-color: rgba(49, 181, 69, 0.5);
  background: rgba(12, 42, 20, 0.92);
  color: #b9f0c1;
}

/* enter / leave / move animations */
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--transition-medium),
    transform var(--transition-medium);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.toast-leave-active {
  position: absolute;
}

.toast-move {
  transition: transform var(--transition-medium);
}
</style>
