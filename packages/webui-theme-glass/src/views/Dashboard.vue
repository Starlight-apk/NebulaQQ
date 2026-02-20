<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="dashboard__stats">
      <GlassCard 
        v-for="(stat, index) in stats" 
        :key="stat.title"
        class="dashboard__stat-card"
        :class="`animate-enter-delay-${index % 4}`"
        effect3d
      >
        <div class="stat-card__icon" :style="{ background: stat.gradient }">
          {{ stat.icon }}
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ stat.value }}</div>
          <div class="stat-card__title">{{ stat.title }}</div>
        </div>
        <div class="stat-card__trend" :class="`stat-card__trend--${stat.trend > 0 ? 'up' : 'down'}`">
          {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
        </div>
      </GlassCard>
    </div>
    
    <!-- 主内容区 -->
    <div class="dashboard__main">
      <!-- 图表区域 -->
      <div class="dashboard__section animate-enter">
        <GlassCard class="dashboard__chart">
          <div class="chart__header">
            <h2 class="chart__title">消息趋势</h2>
            <div class="chart__controls">
              <button 
                v-for="period in ['7 天', '30 天', '90 天']" 
                :key="period"
                class="chart__period"
                :class="{ active: selectedPeriod === period }"
                @click="selectedPeriod = period"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <div class="chart__container">
            <div class="chart__bars">
              <div 
                v-for="(bar, index) in chartData" 
                :key="index"
                class="chart__bar"
                :style="{ height: `${bar.value}%` }"
              >
                <div class="chart__bar-fill" :style="{ background: bar.gradient }"></div>
                <div class="chart__bar-label">{{ bar.label }}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      
      <!-- 插件和日志 -->
      <div class="dashboard__grid">
        <div class="dashboard__section animate-enter-delay-1">
          <GlassCard class="dashboard__panel">
            <div class="panel__header">
              <h3 class="panel__title">🔌 活跃插件</h3>
              <GlassButton variant="ghost" size="sm">查看全部 →</GlassButton>
            </div>
            <div class="panel__content">
              <div 
                v-for="plugin in activePlugins" 
                :key="plugin.name"
                class="plugin-item"
              >
                <div class="plugin-item__icon">{{ plugin.icon }}</div>
                <div class="plugin-item__info">
                  <div class="plugin-item__name">{{ plugin.name }}</div>
                  <div class="plugin-item__desc">{{ plugin.description }}</div>
                </div>
                <div class="plugin-item__status">
                  <span class="status-badge status-badge--success">运行中</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
        
        <div class="dashboard__section animate-enter-delay-2">
          <GlassCard class="dashboard__panel">
            <div class="panel__header">
              <h3 class="panel__title">📝 实时日志</h3>
              <GlassButton variant="ghost" size="sm" icon>⋮</GlassButton>
            </div>
            <div class="panel__content panel__content--logs">
              <div 
                v-for="(log, index) in logs" 
                :key="index"
                class="log-item"
                :class="`log-item--${log.level}`"
              >
                <span class="log-item__time">{{ log.time }}</span>
                <span class="log-item__level">[{{ log.level }}]</span>
                <span class="log-item__message">{{ log.message }}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassCard from '../common/GlassCard.vue';
import GlassButton from '../common/GlassButton.vue';

const stats = ref([
  { icon: '🤖', title: '机器人状态', value: '运行中', trend: 0, gradient: 'linear-gradient(135deg, #4ade80, #22c55e)' },
  { icon: '🧩', title: '在线插件', value: '8', trend: 12.5, gradient: 'linear-gradient(135deg, #a2d2ff, #5c83df)' },
  { icon: '💬', title: '消息统计', value: '1,234', trend: -3.2, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { icon: '👥', title: '活跃用户', value: '567', trend: 8.7, gradient: 'linear-gradient(135deg, #e94560, #c73e54)' },
]);

const selectedPeriod = ref('7 天');

const chartData = ref([
  { label: '周一', value: 65, gradient: 'linear-gradient(180deg, #a2d2ff, transparent)' },
  { label: '周二', value: 78, gradient: 'linear-gradient(180deg, #bde0fe, transparent)' },
  { label: '周三', value: 45, gradient: 'linear-gradient(180deg, #cad7f0, transparent)' },
  { label: '周四', value: 89, gradient: 'linear-gradient(180deg, #5c83df, transparent)' },
  { label: '周五', value: 92, gradient: 'linear-gradient(180deg, #e94560, transparent)' },
  { label: '周六', value: 73, gradient: 'linear-gradient(180deg, #fbbf24, transparent)' },
  { label: '周日', value: 58, gradient: 'linear-gradient(180deg, #4ade80, transparent)' },
]);

const activePlugins = ref([
  { icon: '🎮', name: '游戏插件', description: '支持多种小游戏' },
  { icon: '🎵', name: '音乐插件', description: 'QQ 音乐点歌' },
  { icon: '📅', name: '日程提醒', description: '定时任务管理' },
  { icon: '🌤️', name: '天气插件', description: '实时天气查询' },
]);

const logs = ref([
  { time: '10:23:45', level: 'INFO', message: 'Bot started successfully' },
  { time: '10:24:12', level: 'MSG', message: 'Group message received from 123456' },
  { time: '10:24:15', level: 'PLUGIN', message: 'Hello plugin executed' },
  { time: '10:25:00', level: 'SUCCESS', message: 'Command executed successfully' },
  { time: '10:25:30', level: 'WARNING', message: 'Rate limit approaching' },
]);
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.dashboard {
  padding: var(--spacing-xl);
  max-width: 1600px;
  margin: 0 auto;
  
  &__stats {
    @include grid-auto(250px, var(--spacing-lg));
    margin-bottom: var(--spacing-xl);
  }
  
  &__stat-card {
    @include glass-card;
    padding: var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    position: relative;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-4px) scale(1.02);
    }
  }
  
  &__main {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  &__section {
    @include fade-in-up;
  }
  
  &__grid {
    @include grid-auto(400px, var(--spacing-lg));
  }
  
  &__chart {
    min-height: 400px;
  }
  
  &__panel {
    min-height: 350px;
  }
}

.stat-card {
  &__icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    @include flex-center;
    font-size: 28px;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  &__content {
    flex: 1;
  }
  
  &__value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  &__title {
    font-size: 14px;
    color: var(--text-tertiary);
  }
  
  &__trend {
    font-size: 12px;
    font-weight: 600;
    
    &--up {
      color: var(--success);
    }
    
    &--down {
      color: var(--error);
    }
  }
}

.chart {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  &__controls {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  &__period {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--transition-base);
    
    &:hover {
      background: var(--glass-bg-hover);
    }
    
    &.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    }
  }
  
  &__container {
    height: 300px;
    @include flex-center;
  }
  
  &__bars {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-md);
    height: 250px;
    padding: var(--spacing-lg);
  }
  
  &__bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    position: relative;
    
    &-fill {
      width: 100%;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      transition: height var(--transition-slow);
      position: relative;
      overflow: hidden;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%
        );
        animation: shimmer 2s infinite;
      }
    }
    
    &-label {
      margin-top: var(--spacing-sm);
      font-size: 12px;
      color: var(--text-tertiary);
    }
  }
}

.panel {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    
    &--logs {
      max-height: 250px;
      overflow-y: auto;
      @include scrollbar;
    }
  }
}

.plugin-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--glass-bg-hover);
    transform: translateX(4px);
  }
  
  &__icon {
    font-size: 24px;
  }
  
  &__info {
    flex: 1;
  }
  
  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  &__desc {
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

.log-item {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  gap: var(--spacing-sm);
  
  &:last-child {
    border-bottom: none;
  }
  
  &__time {
    color: var(--text-muted);
    flex-shrink: 0;
  }
  
  &__level {
    flex-shrink: 0;
    font-weight: 600;
  }
  
  &__message {
    color: var(--text-secondary);
  }
  
  &--INFO { --level-color: var(--info); }
  &--MSG { --level-color: var(--color-primary); }
  &--PLUGIN { --level-color: var(--color-secondary); }
  &--SUCCESS { --level-color: var(--success); }
  &--WARNING { --level-color: var(--warning); }
  &--ERROR { --level-color: var(--error); }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--radius-full);
  
  &--success {
    background: rgba(74, 222, 128, 0.2);
    color: var(--success);
    border: 1px solid var(--success);
  }
}
</style>
