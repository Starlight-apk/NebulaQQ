<template>
  <div id="nebula-app" :class="theme">
    <md-drawer id="main-drawer" :open="drawerOpen" @close="drawerOpen = false">
      <div class="drawer-header">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span class="logo-text">NebulaQQ</span>
        </div>
        <md-icon-button @click="drawerOpen = false">
          <md-icon>close</md-icon>
        </md-icon-button>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" active-class="active">
          <md-icon>dashboard</md-icon>
          <span>概览</span>
        </router-link>
        <router-link to="/plugins" class="nav-item" active-class="active">
          <md-icon>extension</md-icon>
          <span>插件管理</span>
        </router-link>
        <router-link to="/modules" class="nav-item" active-class="active">
          <md-icon>widgets</md-icon>
          <span>模块管理</span>
        </router-link>
        <router-link to="/themes" class="nav-item" active-class="active">
          <md-icon>palette</md-icon>
          <span>主题设置</span>
        </router-link>
        <router-link to="/console" class="nav-item" active-class="active">
          <md-icon>terminal</md-icon>
          <span>控制台</span>
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="active">
          <md-icon>settings</md-icon>
          <span>设置</span>
        </router-link>
      </nav>
      
      <div class="drawer-footer">
        <div class="status">
          <div class="status-indicator" :class="botStatus"></div>
          <span>{{ botStatusText }}</span>
        </div>
      </div>
    </md-drawer>

    <div class="main-content">
      <header class="top-bar">
        <md-icon-button @click="drawerOpen = true" class="menu-btn">
          <md-icon>menu</md-icon>
        </md-icon-button>
        
        <h1 class="page-title">{{ pageTitle }}</h1>
        
        <div class="top-bar-actions">
          <md-icon-button @click="toggleTheme">
            <md-icon>{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</md-icon>
          </md-icon-button>
          <md-filled-button @click="restartBot">
            <md-icon>refresh</md-icon>
            重启
          </md-filled-button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const drawerOpen = ref(false);
const theme = ref<'light' | 'dark'>('dark');
const botStatus = ref<'online' | 'offline' | 'starting'>('starting');

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '概览',
    '/plugins': '插件管理',
    '/modules': '模块管理',
    '/themes': '主题设置',
    '/console': '控制台',
    '/settings': '设置'
  };
  return titles[route.path] || 'NebulaQQ';
});

const botStatusText = computed(() => {
  switch (botStatus.value) {
    case 'online': return '运行中';
    case 'offline': return '已离线';
    case 'starting': return '启动中';
    default: return '未知';
  }
});

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme.value);
};

const restartBot = async () => {
  // TODO: 实现重启逻辑
  console.log('Restarting bot...');
};
</script>

<style lang="scss">
@import './styles/variables';
@import './styles/mixins';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --md-sys-color-primary: #{$ark-primary};
  --md-sys-color-on-primary: #{$ark-on-primary};
  --md-sys-color-primary-container: #{$ark-primary-container};
  --md-sys-color-on-primary-container: #{$ark-on-primary-container};
  --md-sys-color-background: #{$ark-background};
  --md-sys-color-on-background: #{$ark-on-background};
  --md-sys-color-surface: #{$ark-surface};
  --md-sys-color-on-surface: #{$ark-on-surface};
  --md-sys-color-surface-variant: #{$ark-surface-variant};
}

#nebula-app {
  display: flex;
  min-height: 100vh;
  background: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  transition: background 0.3s, color 0.3s;

  &.dark {
    --md-sys-color-background: #{$ark-background-dark};
    --md-sys-color-on-background: #{$ark-on-background-dark};
    --md-sys-color-surface: #{$ark-surface-dark};
    --md-sys-color-on-surface: #{$ark-on-surface-dark};
  }
}

#main-drawer {
  width: 280px;
  background: var(--md-sys-color-surface);
  border-right: 1px solid var(--md-sys-color-surface-variant);
  display: flex;
  flex-direction: column;

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--md-sys-color-surface-variant);

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo-icon {
        width: 32px;
        height: 32px;
        color: var(--md-sys-color-primary);
      }

      .logo-text {
        font-size: 20px;
        font-weight: 600;
        background: linear-gradient(135deg, var(--md-sys-color-primary), #{$ark-accent});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  .nav-menu {
    flex: 1;
    padding: 8px 0;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      color: var(--md-sys-color-on-surface);
      text-decoration: none;
      transition: all 0.2s;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--md-sys-color-primary);
        transform: scaleY(0);
        transition: transform 0.2s;
      }

      &:hover {
        background: var(--md-sys-color-surface-variant);
      }

      &.active {
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);

        &::before {
          transform: scaleY(1);
        }
      }

      md-icon {
        width: 24px;
        height: 24px;
      }
    }
  }

  .drawer-footer {
    padding: 16px;
    border-top: 1px solid var(--md-sys-color-surface-variant);

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #{$ark-gray};

        &.online {
          background: #{$ark-success};
          box-shadow: 0 0 8px #{$ark-success};
        }

        &.offline {
          background: #{$ark-error};
        }

        &.starting {
          background: #{$ark-warning};
          animation: pulse 1.5s infinite;
        }
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-surface-variant);

  .menu-btn {
    display: none;

    @media (max-width: 768px) {
      display: inline-flex;
    }
  }

  .page-title {
    flex: 1;
    font-size: 24px;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);
  }

  .top-bar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
