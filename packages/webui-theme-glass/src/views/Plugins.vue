<template>
  <div class="plugins-page">
    <div class="page-header">
      <h1 class="page-title">🧩 插件管理</h1>
      <GlassButton variant="primary" @click="showAddModal = true">+ 添加插件</GlassButton>
    </div>
    
    <div class="plugins-grid">
      <GlassCard 
        v-for="plugin in plugins" 
        :key="plugin.id"
        class="plugin-card"
        effect3d
      >
        <div class="plugin-card__header">
          <div class="plugin-card__icon">{{ plugin.icon }}</div>
          <div class="plugin-card__actions">
            <GlassButton variant="ghost" size="sm" icon>⋮</GlassButton>
          </div>
        </div>
        
        <div class="plugin-card__body">
          <h3 class="plugin-card__name">{{ plugin.name }}</h3>
          <p class="plugin-card__desc">{{ plugin.description }}</p>
          <div class="plugin-card__meta">
            <span class="plugin-card__version">v{{ plugin.version }}</span>
            <span class="plugin-card__author">by {{ plugin.author }}</span>
          </div>
        </div>
        
        <div class="plugin-card__footer">
          <div class="plugin-card__status">
            <span class="status-dot" :class="`status-dot--${plugin.enabled ? 'success' : 'danger'}`"></span>
            {{ plugin.enabled ? '已启用' : '已禁用' }}
          </div>
          <GlassButton 
            :variant="plugin.enabled ? 'default' : 'primary'" 
            size="sm"
            @click="togglePlugin(plugin.id)"
          >
            {{ plugin.enabled ? '禁用' : '启用' }}
          </GlassButton>
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

const plugins = ref([
  { id: 1, icon: '🎮', name: '游戏插件', description: '支持多种小游戏，包括猜谜、成语接龙等', version: '1.2.0', author: 'NebulaQQ', enabled: true },
  { id: 2, icon: '🎵', name: '音乐插件', description: 'QQ 音乐、网易云音乐点歌服务', version: '2.0.1', author: 'NebulaQQ', enabled: true },
  { id: 3, icon: '📅', name: '日程提醒', description: '定时任务管理和提醒服务', version: '1.0.5', author: 'Community', enabled: true },
  { id: 4, icon: '🌤️', name: '天气插件', description: '实时天气查询和预警通知', version: '1.1.0', author: 'NebulaQQ', enabled: false },
  { id: 5, icon: '📰', name: '新闻插件', description: '每日热点新闻推送', version: '1.3.2', author: 'Community', enabled: true },
  { id: 6, icon: '🎲', name: '抽卡模拟', description: '原神、明日方舟抽卡模拟', version: '2.1.0', author: 'Community', enabled: false },
]);

const togglePlugin = (id: number) => {
  const plugin = plugins.value.find(p => p.id === id);
  if (plugin) {
    plugin.enabled = !plugin.enabled;
  }
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.plugins-page {
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

.plugins-grid {
  @include grid-auto(320px, var(--spacing-lg));
}

.plugin-card {
  @include glass-card;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--glass-border);
  }
  
  &__icon {
    font-size: 42px;
    width: 72px;
    height: 72px;
    @include flex-center;
    background: var(--glass-bg);
    border-radius: var(--radius-lg);
  }
  
  &__body {
    flex: 1;
    padding: var(--spacing-lg);
  }
  
  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  &__desc {
    font-size: 14px;
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-md);
    @include line-clamp(2);
  }
  
  &__meta {
    display: flex;
    gap: var(--spacing-md);
    font-size: 12px;
  }
  
  &__version,
  &__author {
    color: var(--text-muted);
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-top: 1px solid var(--glass-border);
  }
  
  &__status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &--success {
    background: var(--success);
    animation: pulse 2s ease-in-out infinite;
  }
  
  &--danger {
    background: var(--error);
  }
}
</style>
