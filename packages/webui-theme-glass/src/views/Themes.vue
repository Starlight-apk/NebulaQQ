<template>
  <div class="themes-page">
    <div class="page-header">
      <h1 class="page-title">🎨 主题设置</h1>
    </div>
    
    <div class="themes-section">
      <h2 class="section-title">预设主题</h2>
      <div class="themes-grid">
        <div 
          v-for="theme in themes" 
          :key="theme.id"
          class="theme-card"
          :class="{ 'theme-card--active': activeTheme === theme.id }"
          @click="activeTheme = theme.id"
        >
          <div class="theme-card__preview" :style="{ background: theme.preview }">
            <div class="theme-card__preview-content">
              <div class="theme-card__preview-sidebar"></div>
              <div class="theme-card__preview-content-area">
                <div class="theme-card__preview-header"></div>
                <div class="theme-card__preview-body"></div>
              </div>
            </div>
          </div>
          <div class="theme-card__info">
            <h3 class="theme-card__name">{{ theme.name }}</h3>
            <p class="theme-card__desc">{{ theme.description }}</p>
          </div>
          <div class="theme-card__check" v-if="activeTheme === theme.id">✓</div>
        </div>
      </div>
    </div>
    
    <div class="themes-section">
      <h2 class="section-title">自定义配色</h2>
      <GlassCard class="customize-card">
        <div class="customize-grid">
          <div class="customize-item" v-for="color in colorOptions" :key="color.key">
            <label class="customize-label">{{ color.label }}</label>
            <div class="customize-input">
              <input 
                type="color" 
                :value="colors[color.key]"
                @input="updateColor(color.key, ($event.target as HTMLInputElement).value)"
                class="color-picker"
              />
              <span class="color-value">{{ colors[color.key] }}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
    
    <div class="themes-section">
      <h2 class="section-title">效果设置</h2>
      <GlassCard class="settings-card">
        <div class="setting-item" v-for="setting in effectSettings" :key="setting.key">
          <div class="setting-info">
            <h4 class="setting-title">{{ setting.title }}</h4>
            <p class="setting-desc">{{ setting.description }}</p>
          </div>
          <div class="toggle" :class="{ active: settings[setting.key] }" @click="toggleSetting(setting.key)"></div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassCard from '../components/common/GlassCard.vue';

const activeTheme = ref('dark');

const themes = [
  { id: 'dark', name: '明日方舟·暗', description: '深色主题，源石风格', preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { id: 'light', name: '罗德岛·光', description: '明亮主题，清爽设计', preview: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)' },
  { id: 'nebula', name: '星云紫', description: '紫色渐变，梦幻风格', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'ocean', name: '海洋蓝', description: '蓝色主题，深邃海洋', preview: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
];

const colors = ref({
  primary: '#a2d2ff',
  secondary: '#e94560',
  accent: '#bde0fe',
  bg: '#0f0c29',
});

const colorOptions = [
  { key: 'primary', label: '主色调' },
  { key: 'secondary', label: '次色调' },
  { key: 'accent', label: '强调色' },
  { key: 'bg', label: '背景色' },
];

const settings = ref({
  glassEffect: true,
  animations: true,
  effect3d: false,
  reducedMotion: false,
});

const effectSettings = [
  { key: 'glassEffect', title: '毛玻璃效果', description: '启用毛玻璃背景效果' },
  { key: 'animations', title: '动画效果', description: '启用页面过渡和元素动画' },
  { key: 'effect3d', title: '3D 效果', description: '启用卡片 3D 悬停效果' },
  { key: 'reducedMotion', title: '减少动画', description: '减少动画时长和幅度' },
];

const updateColor = (key: string, value: string) => {
  colors.value[key] = value;
  document.documentElement.style.setProperty(`--color-${key}`, value);
};

const toggleSetting = (key: string) => {
  settings.value[key] = !settings.value[key];
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.themes-page {
  padding: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  @include fade-in-up;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.themes-section {
  margin-bottom: var(--spacing-2xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.themes-grid {
  @include grid-auto(280px, var(--spacing-lg));
}

.theme-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--bg-secondary);
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
  
  &--active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(162, 210, 255, 0.2);
  }
  
  &__preview {
    height: 160px;
    position: relative;
    overflow: hidden;
    
    &-content {
      display: flex;
      padding: 12px;
      height: 100%;
    }
    
    &-sidebar {
      width: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      margin-right: 8px;
    }
    
    &-content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    &-header {
      height: 20px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      margin-bottom: 8px;
    }
    
    &-body {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  }
  
  &__info {
    padding: var(--spacing-md);
  }
  
  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  &__desc {
    font-size: 12px;
    color: var(--text-tertiary);
  }
  
  &__check {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    width: 24px;
    height: 24px;
    @include flex-center;
    background: var(--color-primary);
    color: #fff;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 700;
    animation: zoom-in 0.3s ease;
  }
}

.customize-card {
  padding: var(--spacing-lg);
}

.customize-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.customize-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.customize-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.customize-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-picker {
  width: 48px;
  height: 40px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: none;
  padding: 0;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
    border-radius: var(--radius-md);
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: var(--radius-md);
  }
}

.color-value {
  font-size: 12px;
  font-family: monospace;
  color: var(--text-tertiary);
}

.settings-card {
  padding: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--glass-border);
  
  &:last-child {
    border-bottom: none;
  }
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>
