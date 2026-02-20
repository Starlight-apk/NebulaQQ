/**
 * NebulaQQ 基础示例
 * 
 * 演示如何创建一个简单的 QQ 机器人
 */

import { NebulaBot, definePlugin } from '@nebulaqq/core';
import { CQ } from '@nebulaqq/utils';

// ========== 示例 1: 简单的问候插件 ==========
const helloPlugin = definePlugin({
  manifest: {
    name: 'hello',
    version: '1.0.0',
    description: '简单的问候插件',
    author: 'NebulaQQ Team'
  },

  async onMessage(ctx) {
    const message = ctx.message.toLowerCase();
    
    // 回复问候
    if (message === 'hello' || message === '你好' || message === 'hi') {
      await ctx.reply('你好！欢迎使用 NebulaQQ! 🌌');
      return;
    }
    
    // 回复时间
    if (message === '时间' || message === '现在几点') {
      const now = new Date().toLocaleString('zh-CN');
      await ctx.reply(`现在的时间是：${now}`);
      return;
    }
    
    // 回复帮助
    if (message === '帮助' || message === 'help') {
      await ctx.reply(
        '可用命令：\n' +
        '- hello/你好：打招呼\n' +
        '- 时间/现在几点：查看当前时间\n' +
        '- 帮助/help：查看帮助\n' +
        '- 测试图片：发送测试图片\n' +
        '- @我：测试 @ 功能'
      );
      return;
    }
    
    // 发送图片示例
    if (message === '测试图片') {
      await ctx.reply([CQ.image('https://picsum.photos/200/300')]);
      return;
    }
    
    // 测试 @ 功能
    if (message.includes('@我')) {
      await ctx.reply([CQ.at(ctx.userId), ' 这是 @ 你的消息！']);
      return;
    }
  }
});

// ========== 示例 2: 群管理插件 ==========
const adminPlugin = definePlugin({
  manifest: {
    name: 'admin',
    version: '1.0.0',
    description: '群管理插件',
    author: 'NebulaQQ Team'
  },

  async onMessage(ctx) {
    // 检查是否是群消息
    if (!ctx.groupId) return;
    
    const message = ctx.message.trim();
    
    // 禁言命令
    if (message.startsWith('#ban ')) {
      const parts = message.split(' ');
      const qq = parts[1];
      const duration = parseInt(parts[2]) || 60;
      
      // 这里需要解析 @ 消息获取 QQ 号
      await ctx.reply('禁言功能需要解析 @ 消息，此处仅做演示');
      return;
    }
    
    // 欢迎新成员
    // 需要在 onNotice 中处理
  },

  async onNotice(ctx) {
    const event = ctx.event as Record<string, unknown>;
    
    // 群成员增加通知
    if (event.notice_type === 'group_increase') {
      const userId = event.user_id;
      const groupId = event.group_id;
      
      await ctx.callApi('send_msg', {
        message_type: 'group',
        group_id: groupId,
        message: `欢迎新成员！👏`
      });
    }
  }
});

// ========== 示例 3: 复读机插件 ==========
const repeatPlugin = definePlugin({
  manifest: {
    name: 'repeat',
    version: '1.0.0',
    description: '复读机插件',
    author: 'NebulaQQ Team'
  },

  // 使用 Map 记录消息出现次数
  messageCount: new Map<string, number>(),

  async onMessage(ctx) {
    if (!ctx.groupId) return;
    
    const message = ctx.message.trim();
    const key = `${ctx.groupId}:${message}`;
    
    // 获取当前计数
    const count = this.messageCount.get(key) || 0;
    const newCount = count + 1;
    this.messageCount.set(key, newCount);
    
    // 当消息重复 3 次时触发复读
    if (newCount === 3) {
      await ctx.reply(`[复读] ${message}`);
      this.messageCount.delete(key);
    }
    
    // 清理旧消息（简单实现）
    if (this.messageCount.size > 100) {
      const keys = Array.from(this.messageCount.keys());
      this.messageCount.delete(keys[0]);
    }
  }
});

// ========== 创建并启动机器人 ==========
async function main() {
  console.log('🌌 NebulaQQ 基础示例\n');
  
  const bot = new NebulaBot({
    logging: {
      level: 'info',
      colors: true
    },
    adapter: {
      type: 'websocket',
      host: '127.0.0.1',
      port: 3000,
      // token: 'your-token-here'
    },
    plugins: [helloPlugin, adminPlugin, repeatPlugin],
    dataDir: './data',
    masterQqs: ['12345678'] // 替换为你的 QQ 号
  });

  // 监听启动事件
  bot.on('ready', (loginInfo) => {
    console.log(`✅ 机器人已就绪`);
    console.log(`   昵称：${loginInfo.nickname}`);
    console.log(`   QQ: ${loginInfo.user_id}`);
    console.log(`\n已加载插件:`);
    bot.pluginManager.list().forEach(p => {
      console.log(`   - ${p.name} v${p.version} [${p.status}]`);
    });
  });

  bot.on('error', (error) => {
    console.error('❌ 机器人错误:', error);
  });

  bot.on('stopped', () => {
    console.log('👋 机器人已停止');
  });

  try {
    await bot.start();
    console.log('🚀 NebulaQQ 启动成功，按 Ctrl+C 停止\n');
    
    // 监听退出信号
    process.on('SIGINT', async () => {
      console.log('\n正在停止机器人...');
      await bot.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await bot.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

main();
