<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">⚙️ 系统配置</h1>
    </div>
    
    <div class="settings-container">
      <div class="settings-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="nav-item"
          :class="{ 'nav-item--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="nav-item__icon">{{ tab.icon }}</span>
          <span class="nav-item__text">{{ tab.name }}</span>
        </button>
      </div>
      
      <div class="settings-content">
        <GlassCard class="settings-panel" v-if="activeTab === 'basic'">
          <h2 class="panel-title">基本设置</h2>
          
          <div class="form-group">
            <label class="form-label">机器人名称</label>
            <input type="text" class="input" v-model="settings.botName" />
          </div>
          
          <div class="form-group">
            <label class="form-label">主人 QQ 号</label>
            <input type="text" class="input" v-model="settings.masterQQ" />
          </div>
          
          <div class="form-group">
            <label class="form-label">命令前缀</label>
            <input type="text" class="input" v-model="settings.commandPrefix" />
          </div>
        </GlassCard>
        
        <GlassCard class="settings-panel" v-if="activeTab === 'account'">
          <h2 class="panel-title">账号管理</h2>
          
          <div class="account-list">
            <div class="account-item" v-for="acc in accounts" :key="acc.id">
              <div class="account-item__info">
                <div class="account-item__name">{{ acc.name }}</div>
                <div class="account-item__id">QQ: {{ acc.id }}</div>
                <div class="account-item__status">
                  <span class="badge" :class="acc.enabled ? 'badge--success' : 'badge--secondary'">
                    {{ acc.enabled ? '已启用' : '已禁用' }}
                  </span>
                  <span class="badge" :class="acc.autoLogin ? 'badge--primary' : 'badge--secondary'">
                    {{ acc.autoLogin ? '自动登录' : '手动登录' }}
                  </span>
                </div>
              </div>
              <div class="account-item__actions">
                <GlassButton variant="ghost" size="sm" @click="toggleAccount(acc.id)">
                  {{ acc.enabled ? '禁用' : '启用' }}
                </GlassButton>
                <GlassButton variant="ghost" size="sm" @click="deleteAccount(acc.id)">删除</GlassButton>
              </div>
            </div>
            
            <div class="account-add" @click="showAddAccount = true">
              <span class="account-add__icon">+</span>
              <span>添加账号</span>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard class="settings-panel" v-if="activeTab === 'adapter'">
          <h2 class="panel-title">适配器配置</h2>
          
          <div class="form-group">
            <label class="form-label">适配器类型</label>
            <select class="input" v-model="settings.adapterType">
              <option value="websocket">WebSocket</option>
              <option value="http">HTTP</option>
              <option value="reverse">反向 WebSocket</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">主机地址</label>
            <input type="text" class="input" v-model="settings.host" />
          </div>
          
          <div class="form-group">
            <label class="form-label">端口</label>
            <input type="number" class="input" v-model="settings.port" />
          </div>
          
          <div class="form-group">
            <label class="form-label">访问令牌</label>
            <input type="password" class="input" v-model="settings.token" />
          </div>
        </GlassCard>
        
        <GlassCard class="settings-panel" v-if="activeTab === 'log'">
          <h2 class="panel-title">日志配置</h2>
          
          <div class="form-group">
            <label class="form-label">日志级别</label>
            <select class="input" v-model="settings.logLevel">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">日志文件路径</label>
            <input type="text" class="input" v-model="settings.logPath" />
          </div>
          
          <div class="form-group">
            <label class="form-label">日志保留天数</label>
            <input type="number" class="input" v-model="settings.logRetention" />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" v-model="settings.logConsole" />
              输出到控制台
            </label>
          </div>
        </GlassCard>
        
        <GlassCard class="settings-panel" v-if="activeTab === 'advanced'">
          <h2 class="panel-title">高级设置</h2>
          
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" v-model="settings.autoReconnect" />
              自动重连
            </label>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" v-model="settings.heartbeat" />
              启用心跳
            </label>
          </div>
          
          <div class="form-group">
            <label class="form-label">重连间隔 (秒)</label>
            <input type="number" class="input" v-model="settings.reconnectInterval" />
          </div>
          
          <div class="form-group">
            <label class="form-label">最大重试次数</label>
            <input type="number" class="input" v-model="settings.maxRetries" />
          </div>
        </GlassCard>
        
        <div class="settings-actions">
          <GlassButton variant="default" @click="resetSettings">重置</GlassButton>
          <GlassButton variant="primary" @click="saveSettings">保存配置</GlassButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassCard from '../components/common/GlassCard.vue';
import GlassButton from '../components/common/GlassButton.vue';

const activeTab = ref('basic');

const tabs = [
  { key: 'basic', name: '基本设置', icon: '🔧' },
  { key: 'account', name: '账号管理', icon: '👤' },
  { key: 'adapter', name: '适配器', icon: '🔌' },
  { key: 'log', name: '日志', icon: '📝' },
  { key: 'advanced', name: '高级', icon: '⚡' },
];

const settings = ref({
  botName: 'NebulaQQ Bot',
  masterQQ: '',
  commandPrefix: '/',
  adapterType: 'websocket',
  host: '127.0.0.1',
  port: '3000',
  token: '',
  logLevel: 'info',
  logPath: './logs',
  logRetention: 30,
  logConsole: true,
  autoReconnect: true,
  heartbeat: true,
  reconnectInterval: 5,
  maxRetries: 5,
});

const showAddAccount = ref(false);

const accounts = ref([
  { id: '12345678', name: '机器人 1 号', enabled: true, autoLogin: true },
  { id: '87654321', name: '机器人 2 号', enabled: false, autoLogin: false },
]);

const toggleAccount = (id: string) => {
  const acc = accounts.value.find(a => a.id === id);
  if (acc) {
    acc.enabled = !acc.enabled;
  }
};

const deleteAccount = (id: string) => {
  const index = accounts.value.findIndex(a => a.id === id);
  if (index !== -1) {
    accounts.value.splice(index, 1);
  }
};

const resetSettings = () => {
  // 重置逻辑
  console.log('Reset settings');
};

const saveSettings = () => {
  // 保存逻辑
  console.log('Save settings:', settings.value);
};
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.settings-page {
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

.settings-container {
  display: flex;
  gap: var(--spacing-lg);
}

.settings-nav {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  @include slide-in(left);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
  font-size: 14px;
  color: var(--text-secondary);
  
  &:hover {
    background: var(--glass-bg-hover);
    transform: translateX(4px);
  }
  
  &--active {
    background: var(--glass-bg-active);
    border-color: var(--color-primary);
    color: var(--text-primary);
  }
  
  &__icon {
    font-size: 18px;
  }
  
  &__text {
    flex: 1;
  }
}

.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  @include slide-in(right);
}

.settings-panel {
  padding: var(--spacing-xl);
  @include fade-in-up;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  
  input[type="checkbox"] {
    margin-right: var(--spacing-sm);
    vertical-align: middle;
  }
}

.input {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all var(--transition-base);
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(162, 210, 255, 0.1);
  }
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--glass-border);
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--glass-bg-hover);
    transform: translateX(4px);
  }
  
  &__info {
    flex: 1;
  }
  
  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  &__id {
    font-size: 14px;
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-sm);
  }
  
  &__status {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  &__actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.account-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--glass-bg);
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--text-secondary);
  
  &:hover {
    border-color: var(--color-primary);
    background: var(--glass-bg-hover);
    color: var(--color-primary);
  }
  
  &__icon {
    font-size: 32px;
    margin-bottom: var(--spacing-sm);
  }
}

.badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  
  &--primary {
    background: rgba(162, 210, 255, 0.2);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
  
  &--success {
    background: rgba(74, 222, 128, 0.2);
    border-color: var(--success);
    color: var(--success);
  }
  
  &--secondary {
    background: rgba(108, 122, 137, 0.2);
    border-color: var(--text-tertiary);
    color: var(--text-tertiary);
  }
}
</style>
