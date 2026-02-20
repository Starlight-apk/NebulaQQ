<template>
  <div class="settings-page">
    <h2>设置</h2>

    <div class="settings-sections">
      <div class="ark-card settings-section">
        <h3>基础设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">机器人昵称</span>
            <span class="setting-description">在消息中显示的昵称</span>
          </div>
          <md-outlined-text-field v-model="settings.nickname" />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">命令前缀</span>
            <span class="setting-description">触发命令的前缀符号</span>
          </div>
          <md-outlined-text-field v-model="settings.commandPrefix" />
        </div>
      </div>

      <div class="ark-card settings-section">
        <h3>OneBot 连接</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">连接类型</span>
            <span class="setting-description">WebSocket 或 HTTP</span>
          </div>
          <md-filled-select v-model="settings.adapterType">
            <md-select-option value="websocket">
              <div slot="label">WebSocket</div>
            </md-select-option>
            <md-select-option value="http">
              <div slot="label">HTTP</div>
            </md-select-option>
          </md-filled-select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">主机地址</span>
            <span class="setting-description">OneBot 服务地址</span>
          </div>
          <md-outlined-text-field v-model="settings.host" />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">端口</span>
            <span class="setting-description">OneBot 服务端口</span>
          </div>
          <md-outlined-text-field v-model="settings.port" type="number" />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">访问令牌</span>
            <span class="setting-description">可选，用于身份验证</span>
          </div>
          <md-outlined-text-field v-model="settings.token" type="password" />
        </div>
      </div>

      <div class="ark-card settings-section">
        <h3>日志设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">日志级别</span>
            <span class="setting-description">控制日志输出详细程度</span>
          </div>
          <md-filled-select v-model="settings.logLevel">
            <md-select-option value="debug">
              <div slot="label">Debug</div>
            </md-select-option>
            <md-select-option value="info">
              <div slot="label">Info</div>
            </md-select-option>
            <md-select-option value="warn">
              <div slot="label">Warn</div>
            </md-select-option>
            <md-select-option value="error">
              <div slot="label">Error</div>
            </md-select-option>
          </md-filled-select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">启用彩色日志</span>
            <span class="setting-description">在控制台显示彩色输出</span>
          </div>
          <md-switch :selected="settings.colors" @click="settings.colors = !settings.colors" />
        </div>
      </div>

      <div class="settings-actions">
        <md-filled-button @click="saveSettings">
          <md-icon>save</md-icon>
          保存设置
        </md-filled-button>
        <md-outlined-button @click="resetSettings">
          <md-icon>undo</md-icon>
          重置
        </md-outlined-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const settings = ref({
  nickname: 'NebulaQQ',
  commandPrefix: '#',
  adapterType: 'websocket',
  host: '127.0.0.1',
  port: '3000',
  token: '',
  logLevel: 'info',
  colors: true
});

const saveSettings = () => {
  console.log('Saving settings:', settings.value);
  // TODO: 保存到配置文件
};

const resetSettings = () => {
  // TODO: 重置为默认值
};
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.settings-page {
  display: flex;
  flex-direction: column;
  gap: 24px;

  h2 {
    font-size: 28px;
    @include text-gradient($ark-primary, $ark-accent);
  }
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  h3 {
    font-size: 18px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--md-sys-color-surface-variant);
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--md-sys-color-surface-variant);

  &:last-child {
    border-bottom: none;
  }

  .setting-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .setting-label {
      font-size: 16px;
      font-weight: 500;
    }

    .setting-description {
      font-size: 12px;
      opacity: 0.6;
    }
  }

  md-outlined-text-field, md-filled-select {
    min-width: 200px;
  }
}

.settings-actions {
  display: flex;
  gap: 12px;
  padding: 20px 0;
}
</style>
