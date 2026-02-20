<template>
  <aside 
    class="sidebar"
    :class="{ 'sidebar--collapsed': collapsed }"
  >
    <div class="sidebar__header">
      <div class="sidebar__logo" v-if="!collapsed">
        <span class="sidebar__logo-icon">🌌</span>
        <span class="sidebar__logo-text">NebulaQQ</span>
      </div>
      <GlassButton 
        variant="ghost" 
        icon 
        @click="$emit('toggle')"
        class="sidebar__toggle"
      >
        {{ collapsed ? '→' : '←' }}
      </GlassButton>
    </div>
    
    <nav class="sidebar__nav">
      <div 
        v-for="item in menuItems" 
        :key="item.path"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': activePath === item.path }"
        @click="navigate(item.path)"
      >
        <span class="sidebar__item-icon">{{ item.icon }}</span>
        <span class="sidebar__item-text" v-if="!collapsed">{{ item.name }}</span>
        <div class="sidebar__item-glow" v-if="activePath === item.path"></div>
      </div>
    </nav>
    
    <div class="sidebar__footer" v-if="!collapsed">
      <div class="sidebar__user">
        <div class="sidebar__avatar">👤</div>
        <div class="sidebar__user-info">
          <div class="sidebar__username">Admin</div>
          <div class="sidebar__status">
            <span class="status-dot"></span>
            在线
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassButton from './GlassButton.vue';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { name: '概览', path: '/dashboard', icon: '📊' },
  { name: '插件管理', path: '/plugins', icon: '🧩' },
  { name: '模块管理', path: '/modules', icon: '🔷' },
  { name: '主题设置', path: '/themes', icon: '🎨' },
  { name: '系统配置', path: '/settings', icon: '⚙️' },
  { name: '日志查看', path: '/logs', icon: '📝' },
];

const activePath = ref('/dashboard');

defineProps<{
  collapsed: boolean
}>();

defineEmits<{
  toggle: []
}>();

const navigate = (path: string) => {
  activePath.value = path;
  // 这里可以使用 vue-router 进行实际导航
  console.log('Navigate to:', path);
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  @include glass;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition-base);
  
  &--collapsed {
    width: var(--sidebar-collapsed-width);
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--glass-border);
  }
  
  &__logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    &-icon {
      font-size: 28px;
      animation: float 3s ease-in-out infinite;
    }
    
    &-text {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  &__toggle {
    border-radius: var(--radius-md);
  }
  
  &__nav {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
  }
  
  &__item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-base);
    
    &:hover {
      background: var(--glass-bg-hover);
    }
    
    &--active {
      background: var(--glass-bg-active);
      border: 1px solid var(--glass-border-highlight);
    }
    
    &-icon {
      font-size: 22px;
      flex-shrink: 0;
    }
    
    &-text {
      font-size: 14px;
      color: var(--text-secondary);
      white-space: nowrap;
    }
    
    &-glow {
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      animation: glow 2s ease-in-out infinite;
    }
  }
  
  &__footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--glass-border);
  }
  
  &__user {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    @include glass;
    @include flex-center;
    font-size: 20px;
  }
  
  &__user-info {
    flex: 1;
    overflow: hidden;
  }
  
  &__username {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  &__status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
</style>
