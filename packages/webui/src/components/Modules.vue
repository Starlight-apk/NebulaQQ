<template>
  <div class="modules-page">
    <div class="page-header">
      <h2>模块管理</h2>
      <md-filled-button @click="addModule">
        <md-icon>add</md-icon>
        添加模块
      </md-filled-button>
    </div>

    <div class="modules-list">
      <div v-for="module in modules" :key="module.id" class="ark-card module-card">
        <div class="module-header">
          <div class="module-info">
            <h3>{{ module.name }}</h3>
            <span class="category">{{ module.category }}</span>
          </div>
          <md-chip :selected="module.enabled" @click="toggleModule(module)">
            {{ module.enabled ? '已启用' : '已禁用' }}
          </md-chip>
        </div>

        <p class="module-description">{{ module.description }}</p>

        <div class="module-footer">
          <div class="module-meta">
            <span class="version">v{{ module.version }}</span>
            <span class="author">by {{ module.author }}</span>
          </div>
          <div class="module-actions">
            <md-icon-button @click="configure(module)">
              <md-icon>settings</md-icon>
            </md-icon-button>
            <md-icon-button @click="remove(module)">
              <md-icon>delete</md-icon>
            </md-icon-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Module {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
}

const modules = ref<Module[]>([
  {
    id: '1',
    name: '命令处理',
    category: '核心',
    description: '提供命令注册和解析功能',
    version: '1.0.0',
    author: 'NebulaQQ',
    enabled: true
  },
  {
    id: '2',
    name: '定时任务',
    category: '工具',
    description: '支持定时任务调度和执行',
    version: '1.1.0',
    author: 'NebulaQQ',
    enabled: true
  },
  {
    id: '3',
    name: '数据统计',
    category: '统计',
    description: '收集和展示机器人运行数据',
    version: '1.0.0',
    author: 'NebulaQQ',
    enabled: false
  }
]);

const addModule = () => {
  console.log('Adding module...');
};

const toggleModule = (module: Module) => {
  module.enabled = !module.enabled;
};

const configure = (module: Module) => {
  console.log(`Configuring ${module.name}...`);
};

const remove = (module: Module) => {
  console.log(`Removing ${module.name}...`);
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.modules-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 28px;
    @include text-gradient($ark-primary, $ark-accent);
  }
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.module-card {
  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .module-info {
      h3 {
        font-size: 18px;
        margin-bottom: 4px;
      }

      .category {
        font-size: 12px;
        padding: 4px 10px;
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        border-radius: 12px;
        display: inline-block;
      }
    }
  }

  .module-description {
    font-size: 14px;
    color: var(--md-sys-color-on-surface);
    opacity: 0.8;
    margin-bottom: 16px;
  }

  .module-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--md-sys-color-surface-variant);

    .module-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      opacity: 0.7;

      .version, .author {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .module-actions {
      display: flex;
      gap: 4px;
    }
  }
}
</style>
