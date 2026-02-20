<template>
  <div 
    class="glass-button"
    :class="[
      `glass-button--${variant}`,
      `glass-button--${size}`,
      { 'glass-button--loading': loading },
      { 'glass-button--icon': icon }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span class="glass-button__ripple" v-if="showRipple"></span>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  loading: false,
  disabled: false,
  icon: false
});

const emit = defineEmits<{
  click: [event: MouseEvent]
}>();

const showRipple = ref(false);

const handleClick = (e: MouseEvent) => {
  if (props.disabled || props.loading) return;
  
  showRipple.value = true;
  setTimeout(() => {
    showRipple.value = false;
  }, 600);
  
  emit('click', e);
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.glass-button {
  @include glass;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: inherit;
  font-weight: 500;
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-base);
  outline: none;
  
  &:hover:not(:disabled) {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-highlight);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(162, 210, 255, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &__ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  }
  
  &--primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    border: none;
    
    &:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(162, 210, 255, 0.4);
    }
  }
  
  &--secondary {
    background: rgba(233, 69, 96, 0.2);
    border-color: var(--color-secondary);
  }
  
  &--ghost {
    background: transparent;
    border-color: transparent;
    
    &:hover:not(:disabled) {
      background: var(--glass-bg);
    }
  }
  
  &--sm {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: 12px;
  }
  
  &--md {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 14px;
  }
  
  &--lg {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: 16px;
  }
  
  &--icon {
    padding: var(--spacing-sm);
    border-radius: 50%;
  }
  
  &--loading {
    pointer-events: none;
  }
}

@keyframes ripple {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}
</style>
