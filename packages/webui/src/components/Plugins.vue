<template>
  <div class="plugins-page">
    <div class="page-header">
      <h2>插件管理</h2>
      <div class="actions">
        <md-filled-button @click="installPlugin">
          <md-icon>add</md-icon>
          安装插件
        </md-filled-button>
        <md-outlined-button @click="reloadAll">
          <md-icon>refresh</md-icon>
          全部重载
        </md-outlined-button>
      </div>
    </div>

    <div class="plugins-grid">
      <div v-for="plugin in plugins" :key="plugin.id" class="ark-card plugin-card">
        <div class="plugin-header">
          <div class="plugin-icon">
            <md-icon>{{ plugin.icon }}</md-icon>
          </div>
          <div class="plugin-info">
            <h3>{{ plugin.name }}</h3>
            <span class="version">v{{ plugin.version }}</span>
          </div>
          <div class="plugin-status">
            <md-switch :selected="plugin.enabled" @click="togglePlugin(plugin)" />
          </div>
        </div>

        <p class="plugin-description">{{ plugin.description }}</p>

        <div class="plugin-meta">
          <div class="meta-item">
            <md-icon>person</md-icon>
            <span>{{ plugin.author }}</span>
          </div>
          <div class="meta-item">
            <md-icon>label</md-icon>
            <div class="tags">
              <span v-for="tag in plugin.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="plugin-actions">
          <md-text-button @click="configure(plugin)">
            <md-icon>settings</md-icon>
            配置
          </md-text-button>
          <md-text-button @click="viewLogs(plugin)">
            <md-icon>description</md-icon>
            日志
          </md-text-button>
          <md-text-button @click="unload(plugin)" class="danger">
            <md-icon>delete</md-icon>
            卸载
          </md-text-button>
        </div>
      </div>
    </div>

    <div v-if="plugins.length === 0" class="empty-state">
      <md-icon>extension</md-icon>
      <h3>暂无插件</h3>
      <p>点击"安装插件"按钮来添加新插件</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  icon: string;
  enabled: boolean;
}

const plugins = ref<Plugin[]>([
  {
    id: '1',
    name: 'AI 聊天',
    version: '1.0.0',
    description: '基于 AI 的智能聊天插件，支持多种 AI 服务',
    author: 'NebulaQQ Team',
    tags: ['AI', '聊天'],
    icon: 'smart_toy',
    enabled: true
  },
  {
    id: '2',
    name: '群管理',
    version: '2.1.0',
    description: '自动化群管理工具，支持欢迎、禁言、踢人等功能',
    author: 'NebulaQQ Team',
    tags: ['管理', '工具'],
    icon: 'admin_panel_settings',
    enabled: true
  },
  {
    id: '3',
    name: '签到',
    version: '1.2.0',
    description: '每日签到功能，支持积分系统和排行榜',
    author: 'NebulaQQ Team',
    tags: ['娱乐', '签到'],
    icon: 'today',
    enabled: false
  }
]);

const installPlugin = () => {
  console.log('Installing plugin...');
};

const reloadAll = () => {
  console.log('Reloading all plugins...');
};

const togglePlugin = (plugin: Plugin) => {
  plugin.enabled = !plugin.enabled;
  console.log(`Plugin ${plugin.name} ${plugin.enabled ? 'enabled' : 'disabled'}`);
};

const configure = (plugin: Plugin) => {
  console.log(`Configuring ${plugin.name}...`);
};

const viewLogs = (plugin: Plugin) => {
  console.log(`Viewing logs for ${plugin.name}...`);
};

const unload = (plugin: Plugin) => {
  console.log(`Unloading ${plugin.name}...`);
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.plugins-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    font-size: 28px;
    @include text-gradient($ark-primary, $ark-accent);
  }

  .actions {
    display: flex;
    gap: 12px;
  }
}

.plugins-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.plugin-card {
  transition: transform $ark-transition-normal, box-shadow $ark-transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $ark-shadow-lg;
  }

  .plugin-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .plugin-icon {
      width: 48px;
      height: 48px;
      border-radius: $ark-radius-md;
      background: $ark-gradient-primary;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      md-icon {
        font-size: 28px;
      }
    }

    .plugin-info {
      flex: 1;

      h3 {
        font-size: 18px;
        margin-bottom: 4px;
      }

      .version {
        font-size: 12px;
        opacity: 0.6;
      }
    }
  }

  .plugin-description {
    font-size: 14px;
    color: var(--md-sys-color-on-surface);
    opacity: 0.8;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .plugin-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--md-sys-color-surface-variant);

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      md-icon {
        font-size: 18px;
        opacity: 0.7;
      }

      .tags {
        display: flex;
        gap: 8px;
      }

      .tag {
        padding: 4px 10px;
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        border-radius: 12px;
        font-size: 12px;
      }
    }
  }

  .plugin-actions {
    display: flex;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--md-sys-color-surface-variant);

    md-text-button.danger {
      --md-text-button-label-text-color: #{$ark-error};
      
      &:hover {
        --md-text-button-container-color: #{rgba($ark-error, 0.1)};
      }
    }
  }
}
</style>
