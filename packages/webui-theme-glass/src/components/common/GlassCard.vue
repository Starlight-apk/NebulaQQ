<template>
  <div 
    class="glass-card"
    :class="[
      `glass-card--${variant}`,
      { 'glass-card--hover': hoverable },
      { 'glass-card--3d': effect3d }
    ]"
    :style="cardStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  hoverable?: boolean;
  effect3d?: boolean;
  intensity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: true,
  effect3d: false,
  intensity: 1
});

const isHovered = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);

const cardStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.effect3d && isHovered.value) {
    const rotateX = (mouseY.value - 0.5) * -20 * props.intensity;
    const rotateY = (mouseX.value - 0.5) * 20 * props.intensity;
    style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  }
  
  return style;
});

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
  mouseX.value = 0.5;
  mouseY.value = 0.5;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!props.effect3d) return;
  
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  mouseX.value = (e.clientX - rect.left) / rect.width;
  mouseY.value = (e.clientY - rect.top) / rect.height;
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.glass-card {
  @include glass-card;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
    pointer-events: none;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &--default {
    background: var(--glass-bg);
  }
  
  &--primary {
    background: rgba(162, 210, 255, 0.1);
    border-color: var(--color-primary);
  }
  
  &--secondary {
    background: rgba(233, 69, 96, 0.1);
    border-color: var(--color-secondary);
  }
  
  &--accent {
    background: rgba(189, 224, 254, 0.1);
    border-color: var(--color-accent);
  }
  
  &--hover:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 20px 60px rgba(162, 210, 255, 0.15);
  }
  
  &--3d {
    transition: transform 0.3s ease;
    transform-style: preserve-3d;
  }
}
</style>
