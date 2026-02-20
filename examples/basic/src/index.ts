/**
 * My NebulaQQ Bot
 * 
 * 在此处创建你的机器人插件
 */

import { NebulaBot, definePlugin } from '@nebulaqq/core';

// TODO: 在此处定义你的插件
const myPlugin = definePlugin({
  manifest: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的插件'
  },

  async onMessage(ctx) {
    // TODO: 在此处处理消息
    // 示例：当收到 "hello" 时回复
    // if (ctx.message === 'hello') {
    //   await ctx.reply('你好！');
    // }
  }
});

// 创建机器人实例
const bot = new NebulaBot({
  logging: {
    level: 'info',      // debug | info | warn | error
    colors: true
  },
  adapter: {
    type: 'websocket',  // websocket | http
    host: '127.0.0.1',
    port: 3000
    // token: 'your-token-here'
  },
  plugins: [myPlugin],
  dataDir: './data'
});

// 监听事件
bot.on('ready', (loginInfo) => {
  console.log(`✅ 机器人已就绪：${loginInfo.nickname}(${loginInfo.user_id})`);
});

bot.on('error', (error) => {
  console.error('❌ 错误:', error);
});

// 启动机器人
async function main() {
  try {
    await bot.start();
    console.log('🚀 NebulaQQ 启动成功');
    
    // 监听退出信号
    process.on('SIGINT', async () => {
      console.log('\n正在停止机器人...');
      await bot.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

main();
