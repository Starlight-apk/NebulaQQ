<template>
  <div class="themes-page">
    <h2>主题设置</h2>
    
    <div class="themes-grid">
      <div v-for="theme in themes" :key="theme.id" class="ark-card theme-card" :class="{ active: currentTheme === theme.id }">
        <div class="theme-preview" :style="{ background: theme.preview }">
          <div class="theme-name">{{ theme.name }}</div>
        </div>
        <div class="theme-info">
          <h3>{{ theme.displayName }}</h3>
          <p>{{ theme.description }}</p>
        </div>
        <md-filled-button @click="applyTheme(theme.id)" :disabled="currentTheme === theme.id">
          {{ currentTheme === theme.id ? '已应用' : '应用' }}
        </md-filled-button>
      </div>
    </div>

    <div class="ark-card customization">
      <h3>自定义</h3>
      <div class="custom-options">
        <div class="custom-option">
          <label>主色调</label>
          <input type="color" v-model="customColors.primary" />
        </div>
        <div class="custom-option">
          <label>强调色</label>
          <input type="color" v-model="customColors.accent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentTheme = ref('dark');
const customColors = ref({
  primary: '#0099cc',
  accent: '#ff6699'
});

const themes = ref([
  {
    id: 'dark',
    name: 'Dark',
    displayName: '明日方舟·暗',
    description: '深色主题，源石风格设计',
    preview: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)'
  },
  {
    id: 'light',
    name: 'Light',
    displayName: '罗德岛·光',
    description: '明亮主题，简洁清爽',
    preview: 'linear-gradient(135deg, #f5f5f5, #ffffff)'
  },
  {
    id: 'arknight',
    name: 'Arknights',
    displayName: '源石技艺',
    description: '源石晶格特效主题',
    preview: 'linear-gradient(135deg, #1a1a2e, #003344)'
  }
]);

const applyTheme = (themeId: string) => {
  currentTheme.value = themeId;
  document.documentElement.setAttribute('data-theme', themeId);
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.themes-page {
  display: flex;
  flex-direction: column;
  gap: 24px;

  h2 {
    font-size: 28px;
    @include text-gradient($ark-primary, $ark-accent);
  }
}

.themes-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.theme-card {
  &.active {
    border: 2px solid $ark-primary;
    box-shadow: $ark-shadow-glow;
  }

  .theme-preview {
    height: 120px;
    border-radius: $ark-radius-md;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    .theme-name {
      color: white;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
  }

  .theme-info {
    margin-bottom: 16px;

    h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      opacity: 0.7;
    }
  }
}

.customization {
  h3 {
    margin-bottom: 16px;
  }

  .custom-options {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;

    .custom-option {
      display: flex;
      align-items: center;
      gap: 12px;

      label {
        font-size: 14px;
      }

      input[type="color"] {
        width: 48px;
        height: 48px;
        border: none;
        border-radius: $ark-radius-sm;
        cursor: pointer;
      }
    }
  }
}
</style>
