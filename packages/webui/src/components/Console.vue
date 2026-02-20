<template>
  <div class="console-page">
    <div class="page-header">
      <h2>控制台</h2>
      <div class="actions">
        <md-outlined-button @click="clearConsole">
          <md-icon>delete_sweep</md-icon>
          清空
        </md-outlined-button>
        <md-outlined-button @click="exportLogs">
          <md-icon>download</md-icon>
          导出
        </md-outlined-button>
      </div>
    </div>

    <div class="console-output" ref="consoleOutput">
      <div v-for="(line, index) in logs" :key="index" class="log-line" :class="line.level">
        <span class="log-time">{{ line.time }}</span>
        <span class="log-level">[{{ line.level }}]</span>
        <span class="log-message">{{ line.message }}</span>
      </div>
    </div>

    <div class="console-input">
      <md-outlined-text-field
        v-model="command"
        placeholder="输入命令..."
        @keydown.enter="executeCommand"
        class="command-input"
      >
        <template #trailing-icon>
          <md-icon-button @click="executeCommand">
            <md-icon>send</md-icon>
          </md-icon-button>
        </template>
      </md-outlined-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface LogLine {
  time: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

const logs = ref<LogLine[]>([
  { time: '00:00:00', level: 'info', message: 'NebulaQQ 启动中...' },
  { time: '00:00:01', level: 'info', message: '加载插件...' },
  { time: '00:00:02', level: 'info', message: '插件 "AI 聊天" 已加载' },
  { time: '00:00:02', level: 'info', message: '插件 "群管理" 已加载' },
  { time: '00:00:03', level: 'info', message: '连接 OneBot 服务...' },
  { time: '00:00:04', level: 'info', message: 'WebSocket 连接已建立' },
  { time: '00:00:04', level: 'info', message: '机器人已就绪：NebulaQQ (12345678)' }
]);

const command = ref('');
const consoleOutput = ref<HTMLElement | null>(null);

const clearConsole = () => {
  logs.value = [];
};

const exportLogs = () => {
  const content = logs.value.map(l => `[${l.time}][${l.level}] ${l.message}`).join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nebulaqq-logs-${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const executeCommand = () => {
  if (!command.value.trim()) return;
  
  logs.value.push({
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    level: 'info',
    message: `> ${command.value}`
  });
  
  // TODO: 执行命令
  console.log('Executing:', command.value);
  command.value = '';
  
  nextTick(() => {
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight;
    }
  });
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.console-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 28px;
    @include text-gradient($ark-primary, $ark-accent);
  }

  .actions {
    display: flex;
    gap: 12px;
  }
}

.console-output {
  flex: 1;
  background: var(--md-sys-color-surface);
  border-radius: $ark-radius-md;
  padding: 16px;
  overflow: auto;
  font-family: $ark-font-mono;
  font-size: 13px;
  @include custom-scrollbar;

  .log-line {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid var(--md-sys-color-surface-variant);

    &:last-child {
      border-bottom: none;
    }

    &.info { color: $ark-info; }
    &.warn { color: $ark-warning; }
    &.error { color: $ark-error; }
    &.debug { color: $ark-gray-light; }

    .log-time {
      opacity: 0.6;
      min-width: 70px;
    }

    .log-level {
      min-width: 50px;
      font-weight: 600;
    }

    .log-message {
      flex: 1;
      word-break: break-all;
    }
  }
}

.console-input {
  .command-input {
    width: 100%;
  }
}
</style>
