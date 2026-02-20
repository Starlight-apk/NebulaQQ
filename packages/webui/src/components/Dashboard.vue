<template>
  <div class="dashboard">
    <!-- 状态卡片 -->
    <div class="status-cards">
      <div class="ark-card status-card">
        <div class="card-header">
          <md-icon>robot</md-icon>
          <span>机器人状态</span>
        </div>
        <div class="status-indicator" :class="botStatus"></div>
        <div class="data-value">{{ botStatusText }}</div>
        <div class="data-label">运行时长：{{ uptime }}</div>
      </div>

      <div class="ark-card status-card">
        <div class="card-header">
          <md-icon>people</md-icon>
          <span>用户统计</span>
        </div>
        <div class="data-value">{{ stats.users }}</div>
        <div class="data-label">活跃用户</div>
      </div>

      <div class="ark-card status-card">
        <div class="card-header">
          <md-icon>forum</md-icon>
          <span>消息统计</span>
        </div>
        <div class="data-value">{{ stats.messages }}</div>
        <div class="data-label">今日消息</div>
      </div>

      <div class="ark-card status-card">
        <div class="card-header">
          <md-icon>extension</md-icon>
          <span>插件统计</span>
        </div>
        <div class="data-value">{{ stats.plugins }}/{{ stats.totalPlugins }}</div>
        <div class="data-label">已加载插件</div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="ark-card quick-actions">
      <h3>快捷操作</h3>
      <div class="action-buttons">
        <md-filled-button @click="reloadPlugins">
          <md-icon>refresh</md-icon>
          重载插件
        </md-filled-button>
        <md-outlined-button @click="viewLogs">
          <md-icon>description</md-icon>
          查看日志
        </md-outlined-button>
        <md-outlined-button @click="openConfig">
          <md-icon>edit</md-icon>
          编辑配置
        </md-outlined-button>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="ark-card recent-activity">
      <h3>最近活动</h3>
      <div class="activity-list">
        <div v-for="item in recentActivities" :key="item.id" class="activity-item">
          <md-icon :class="item.type">{{ item.icon }}</md-icon>
          <div class="activity-content">
            <span class="activity-text">{{ item.text }}</span>
            <span class="activity-time">{{ item.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="system-info">
      <div class="ark-card">
        <h3>系统信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Node.js</span>
            <span class="value">{{ systemInfo.nodeVersion }}</span>
          </div>
          <div class="info-item">
            <span class="label">内存使用</span>
            <span class="value">{{ systemInfo.memory }}</span>
          </div>
          <div class="info-item">
            <span class="label">运行时间</span>
            <span class="value">{{ systemInfo.uptime }}</span>
          </div>
          <div class="info-item">
            <span class="label">版本</span>
            <span class="value">{{ systemInfo.version }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const botStatus = ref<'online' | 'offline' | 'starting'>('online');
const uptime = ref('2 小时 30 分钟');

const stats = ref({
  users: 128,
  messages: 1024,
  plugins: 8,
  totalPlugins: 10
});

const recentActivities = ref([
  { id: 1, type: 'success', icon: 'check_circle', text: '插件 "AI 聊天" 已加载', time: '10 分钟前' },
  { id: 2, type: 'info', icon: 'info', text: '机器人启动成功', time: '2 小时前' },
  { id: 3, type: 'warning', icon: 'warning', text: 'API 调用频率限制', time: '3 小时前' }
]);

const systemInfo = ref({
  nodeVersion: 'v20.10.0',
  memory: '128 MB / 512 MB',
  uptime: '2 小时 30 分钟',
  version: 'v1.0.0'
});

const botStatusText = computed(() => {
  switch (botStatus.value) {
    case 'online': return '运行中';
    case 'offline': return '已离线';
    case 'starting': return '启动中';
    default: return '未知';
  }
});

const reloadPlugins = async () => {
  console.log('Reloading plugins...');
};

const viewLogs = async () => {
  console.log('Viewing logs...');
};

const openConfig = async () => {
  console.log('Opening config...');
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.dashboard {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.status-cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-column: 1 / -1;
}

.status-card {
  text-align: center;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
    color: var(--md-sys-color-on-surface);
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin: 0 auto 12px;
    background: $ark-gray;

    &.online {
      background: $ark-success;
      box-shadow: 0 0 12px $ark-success;
    }

    &.offline {
      background: $ark-error;
    }

    &.starting {
      background: $ark-warning;
      animation: pulse 1.5s infinite;
    }
  }

  .data-value {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .data-label {
    font-size: 14px;
    color: var(--md-sys-color-on-surface);
    opacity: 0.7;
  }
}

.quick-actions {
  grid-column: 1 / -1;

  h3 {
    margin-bottom: 16px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.recent-activity {
  grid-column: 1 / -1;

  h3 {
    margin-bottom: 16px;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--md-sys-color-surface-variant);
    border-radius: $ark-radius-sm;

    md-icon {
      &.success { color: $ark-success; }
      &.info { color: $ark-info; }
      &.warning { color: $ark-warning; }
      &.error { color: $ark-error; }
    }

    .activity-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-text {
      font-size: 14px;
    }

    .activity-time {
      font-size: 12px;
      opacity: 0.6;
    }
  }
}

.system-info {
  grid-column: 1 / -1;

  h3 {
    margin-bottom: 16px;
  }

  .info-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 12px;
      opacity: 0.7;
    }

    .value {
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>
