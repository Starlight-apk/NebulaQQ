<template>
  <header class="header">
    <div class="header__left">
      <h1 class="header__title">{{ title }}</h1>
    </div>
    
    <div class="header__right">
      <div class="header__search">
        <input 
          type="text" 
          class="header__search-input"
          placeholder="搜索..."
          v-model="searchQuery"
        />
        <span class="header__search-icon">🔍</span>
      </div>
      
      <div class="header__actions">
        <GlassButton variant="ghost" icon class="header__action-btn" @click="toggleTheme">
          {{ isDark ? '☀️' : '🌙' }}
        </GlassButton>
        
        <GlassButton variant="ghost" icon class="header__action-btn">
          🔔
          <span class="header__badge" v-if="notifications > 0">{{ notifications }}</span>
        </GlassButton>
        
        <GlassButton variant="ghost" icon class="header__action-btn">
          ⚙️
        </GlassButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassButton from '../common/GlassButton.vue';

defineProps<{
  title?: string
}>();

const searchQuery = ref('');
const notifications = ref(3);
const isDark = ref(true);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.header {
  position: sticky;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--header-height);
  @include glass;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  z-index: 90;
  transition: left var(--transition-base);
  
  :global(.sidebar--collapsed) ~ & {
    left: var(--sidebar-collapsed-width);
  }
  
  &__left {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  &__title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    @include fade-in-up;
  }
  
  &__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  &__search {
    position: relative;
    width: 300px;
    
    &-input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-lg);
      padding-right: 48px;
      @include glass;
      border-radius: var(--radius-full);
      font-size: 14px;
      color: var(--text-primary);
      outline: none;
      transition: all var(--transition-base);
      
      &::placeholder {
        color: var(--text-muted);
      }
      
      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(162, 210, 255, 0.1);
      }
    }
    
    &-icon {
      position: absolute;
      right: var(--spacing-md);
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      color: var(--text-muted);
    }
  }
  
  &__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  &__action-btn {
    position: relative;
    border-radius: var(--radius-md);
  }
  
  &__badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    @include flex-center;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
    border-radius: var(--radius-full);
    animation: zoom-in 0.3s ease;
  }
}
</style>
