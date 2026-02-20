/**
 * NebulaQQ 插件模板
 * 
 * 使用此模板创建新的插件
 */

import { definePlugin, type MessageContext, type PluginContext } from '@nebulaqq/core';

/**
 * 插件配置接口
 */
interface MyPluginConfig {
  enabled: boolean;
  commandPrefix: string;
  cooldownSeconds: number;
}

/**
 * 插件状态类
 */
class MyPluginState {
  config: MyPluginConfig = {
    enabled: true,
    commandPrefix: '#',
    cooldownSeconds: 10
  };
  
  ctx?: PluginContext;
  startTime = 0;
  
  // 冷却时间记录
  cooldowns = new Map<string, number>();
  
  /**
   * 初始化插件
   */
  init(ctx: PluginContext): void {
    this.ctx = ctx;
    this.startTime = Date.now();
    this.loadConfig();
    ctx.logger.info('插件已初始化');
  }
  
  /**
   * 加载配置
   */
  loadConfig(): void {
    // 从文件加载配置的逻辑
    // this.config = ...
  }
  
  /**
   * 保存配置
   */
  saveConfig(): void {
    // 保存配置到文件的逻辑
  }
  
  /**
   * 检查冷却时间
   */
  checkCooldown(userId: string): boolean {
    const now = Date.now();
    const lastUse = this.cooldowns.get(userId) || 0;
    
    if (now - lastUse < this.config.cooldownSeconds * 1000) {
      return false;
    }
    
    this.cooldowns.set(userId, now);
    return true;
  }
  
  /**
   * 清理
   */
  cleanup(): void {
    this.saveConfig();
    this.cooldowns.clear();
  }
}

const state = new MyPluginState();

/**
 * 定义插件
 */
export const myPlugin = definePlugin({
  manifest: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的插件模板',
    author: 'Your Name',
    tags: ['工具', '娱乐']
  },

  /**
   * 插件初始化
   */
  async onInit(ctx: PluginContext) {
    state.init(ctx);
    
    ctx.logger.info('MyPlugin 加载成功');
  },

  /**
   * 消息事件处理
   */
  async onMessage(ctx: MessageContext) {
    if (!state.config.enabled) return;
    
    const message = ctx.message.trim();
    const prefix = state.config.commandPrefix;
    
    // 检查是否以命令前缀开头
    if (!message.startsWith(prefix)) return;
    
    // 检查冷却时间
    if (!state.checkCooldown(ctx.userId)) {
      await ctx.reply('命令冷却中，请稍后再试');
      return;
    }
    
    // 解析命令
    const command = message.slice(prefix.length).split(' ')[0].toLowerCase();
    const args = message.slice(prefix.length).split(' ').slice(1);
    
    // 处理命令
    switch (command) {
      case 'help':
        await handleHelp(ctx);
        break;
      case 'info':
        await handleInfo(ctx);
        break;
      case 'test':
        await handleTest(ctx);
        break;
      default:
        await ctx.reply(`未知命令：${command}\n使用 ${prefix}help 查看帮助`);
    }
  },

  /**
   * 通知事件处理
   */
  async onNotice(ctx) {
    // 处理通知事件
    // 如：群成员加入、管理员变更等
  },

  /**
   * 请求事件处理
   */
  async onRequest(ctx) {
    // 处理请求事件
    // 如：好友请求、加群请求等
  },

  /**
   * 插件清理
   */
  async onCleanup() {
    state.cleanup();
    state.ctx?.logger.info('MyPlugin 已卸载');
  }
});

// ========== 命令处理函数 ==========

async function handleHelp(ctx: MessageContext): Promise<void> {
  await ctx.reply(
    'MyPlugin 帮助\n\n' +
    '可用命令:\n' +
    `${state.config.commandPrefix}help - 查看帮助\n` +
    `${state.config.commandPrefix}info - 查看插件信息\n` +
    `${state.config.commandPrefix}test - 测试命令`
  );
}

async function handleInfo(ctx: MessageContext): Promise<void> {
  const uptime = Date.now() - state.startTime;
  const hours = Math.floor(uptime / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  await ctx.reply(
    'MyPlugin 信息\n\n' +
    `版本：1.0.0\n` +
    `运行时长：${hours}小时${minutes}分钟\n` +
    `状态：${state.config.enabled ? '已启用' : '已禁用'}`
  );
}

async function handleTest(ctx: MessageContext): Promise<void> {
  await ctx.reply('测试成功！✅');
}

export default myPlugin;
