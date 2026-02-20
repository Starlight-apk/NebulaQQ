<template>
  <div class="modules-page">
    <div class="page-header">
      <h1 class="page-title">🔷 模块管理</h1>
      <GlassButton variant="primary" @click="showAddModal = true">+ 添加模块</GlassButton>
    </div>
    
    <div class="modules-list">
      <GlassCard 
        v-for="module in modules" 
        :key="module.id"
        class="module-item"
        effect3d
      >
        <div class="module-item__left">
          <div class="module-item__icon">{{ module.icon }}</div>
          <div class="module-item__info">
            <h3 class="module-item__name">{{ module.name }}</h3>
            <p class="module-item__desc">{{ module.description }}</p>
            <div class="module-item__meta">
              <span class="badge">v{{ module.version }}</span>
              <span class="badge badge--success" v-if="module.loaded">已加载</span>
            </div>
          </div>
        </div>
        
        <div class="module-item__actions">
          <div class="module-item__stats">
            <div class="stat">
              <span class="stat-value">{{ module.memory }}</span>
              <span class="stat-label">内存</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ module.events }}</span>
              <span class="stat-label">事件</span>
            </div>
          </div>
          <div class="module-item__buttons">
            <GlassButton variant="ghost" size="sm" icon>⚙️</GlassButton>
            <GlassButton 
              :variant="module.loaded ? 'default' : 'primary'" 
              size="sm"
              @click="toggleModule(module.id)"
            >
              {{ module.loaded ? '卸载' : '加载' }}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassCard from '../components/common/GlassCard.vue';
import GlassButton from '../components/common/GlassButton.vue';

const showAddModal = ref(false);

const modules = ref([
  { id: 1, icon: '🔌', name: 'OneBot 适配器', description: 'OneBot v11 协议适配器，支持 WebSocket 和 HTTP', version: '1.0.0', loaded: true, memory: '24MB', events: 12 },
  { id: 2, icon: '🌐', name: 'WebUI 服务器', description: 'Web 控制面板后端服务', version: '1.2.0', loaded: true, memory: '48MB', events: 8 },
  { id: 3, icon: '💾', name: '数据库模块', description: 'SQLite/MySQL 数据库支持', version: '1.1.0', loaded: true, memory: '16MB', events: 5 },
  { id: 4, icon: '📡', name: '网络请求模块', description: 'HTTP 客户端和 WebSocket 客户端', version: '1.0.5', loaded: false, memory: '-', events: 0 },
  { id: 5, icon: '🔐', name: '认证模块', description: '用户认证和权限管理', version: '1.0.0', loaded: true, memory: '8MB', events: 3 },
]);

const toggleModule = (id: number) => {
  const module = modules.value.find(m => m.id === id);
  if (module) {
    module.loaded = !module.loaded;
  }
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.modules-page {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  @include fade-in-up;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.module-item {
  @include glass-card;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  
  &__left {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  &__icon {
    width: 64px;
    height: 64px;
    @include flex-center;
    font-size: 32px;
    background: var(--glass-bg);
    border-radius: var(--radius-lg);
  }
  
  &__info {
    flex: 1;
  }
  
  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  &__desc {
    font-size: 14px;
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-sm);
  }
  
  &__meta {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  &__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
  }
  
  &__stats {
    display: flex;
    gap: var(--spacing-lg);
  }
  
  &__buttons {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.stat {
  text-align: center;
  
  &-value {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
  }
  
  &-label {
    font-size: 12px;
    color: var(--text-muted);
  }
}

.badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  
  &--success {
    background: rgba(74, 222, 128, 0.2);
    border-color: var(--success);
    color: var(--success);
  }
}
</style>
