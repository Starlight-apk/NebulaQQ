#!/usr/bin/env node

/**
 * NebulaQQ CLI
 * 
 * 快速创建 QQ 机器人项目
 */

import { Command } from 'commander';
import prompts from 'prompts';
import { lightGreen, cyan, yellow } from 'kolorist';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .name('create-nebulaqq')
  .description('创建新的 NebulaQQ 机器人项目')
  .version('1.0.0');

program
  .command('create [project-name]')
  .description('创建一个新的机器人项目')
  .option('-t, --template <template>', '模板名称 (default|plugin|module)', 'default')
  .action(async (projectName, options) => {
    try {
      // 如果没有提供项目名称，询问用户
      if (!projectName) {
        const response = await prompts({
          type: 'text',
          name: 'projectName',
          message: '请输入项目名称:',
          initial: 'my-nebula-bot'
        });
        projectName = response.projectName;
      }

      // 询问模板选择
      const templateResponse = await prompts({
        type: 'select',
        name: 'template',
        message: '选择项目模板:',
        choices: [
          { title: '默认模板', value: 'default', description: '基础的机器人项目' },
          { title: '插件模板', value: 'plugin', description: '开发新插件的项目' },
          { title: '模块模板', value: 'module', description: '开发新模块的项目' }
        ],
        initial: 0
      });

      const template = options.template || templateResponse.template || 'default';
      const targetDir = path.resolve(process.cwd(), projectName);

      console.log(`\n${cyan('正在创建项目:')} ${lightGreen(projectName)}`);
      console.log(`${cyan('模板:')} ${lightGreen(template)}\n`);

      // 创建项目目录
      await fs.ensureDir(targetDir);

      // 复制模板文件
      const templateDir = path.join(__dirname, '..', 'templates', template);
      
      if (await fs.pathExists(templateDir)) {
        await fs.copy(templateDir, targetDir);
      } else {
        // 如果没有模板目录，创建基础文件
        await createDefaultProject(targetDir, projectName);
      }

      // 重命名 gitignore
      const gitignorePath = path.join(targetDir, 'gitignore');
      if (await fs.pathExists(gitignorePath)) {
        await fs.rename(gitignorePath, path.join(targetDir, '.gitignore'));
      }

      console.log(yellow('\n项目创建完成！\n'));
      console.log(`  ${cyan('cd')} ${projectName}`);
      console.log(`  ${cyan('pnpm install')}`);
      console.log(`  ${cyan('pnpm dev')}\n`);

    } catch (error) {
      console.error(yellow('创建项目失败:'), error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('在当前目录初始化项目')
  .action(async () => {
    console.log(cyan('初始化项目...'));
    await createDefaultProject(process.cwd(), 'nebula-bot');
    console.log(lightGreen('初始化完成!'));
  });

program.parse();

/**
 * 创建默认项目结构
 */
async function createDefaultProject(targetDir: string, projectName: string): Promise<void> {
  // package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'node --loader ts-node/esm src/index.ts',
      start: 'node dist/index.js',
      build: 'tsc'
    },
    dependencies: {
      '@nebulaqq/core': 'workspace:*',
      '@nebulaqq/utils': 'workspace:*'
    },
    devDependencies: {
      'typescript': '^5.3.0',
      'ts-node': '^10.9.0',
      '@types/node': '^20.10.0'
    }
  };

  await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      esModuleInterop: true,
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeJson(path.join(targetDir, 'tsconfig.json'), tsconfig, { spaces: 2 });

  // src/index.ts
  const indexTs = `import { NebulaBot, definePlugin } from '@nebulaqq/core';

// 定义一个简单的插件
const helloPlugin = definePlugin({
  manifest: {
    name: 'hello',
    version: '1.0.0',
    description: 'Hello World 插件'
  },

  async onMessage(ctx) {
    if (ctx.message === 'hello' || ctx.message === '你好') {
      await ctx.reply('你好！欢迎使用 NebulaQQ! 🌌');
    }
  }
});

// 创建机器人
const bot = new NebulaBot({
  logging: {
    level: 'info',
    colors: true
  },
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',
    port: 3000
  },
  plugins: [helloPlugin],
  dataDir: './data'
});

// 监听事件
bot.on('ready', (loginInfo) => {
  console.log(\`机器人已就绪：\${loginInfo.nickname}(\${loginInfo.user_id})\`);
});

bot.on('error', (error) => {
  console.error('机器人错误:', error);
});

// 启动机器人
async function main() {
  try {
    await bot.start();
    console.log('NebulaQQ 启动成功!');
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

main();
`;

  await fs.writeFile(path.join(targetDir, 'src', 'index.ts'), indexTs);

  // .gitignore
  const gitignore = `node_modules
dist
data
*.log
.env
`;

  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore);

  // README.md
  const readme = `# ${projectName}

使用 NebulaQQ 框架创建的 QQ 机器人。

## 快速开始

\`\`\`bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产环境运行
pnpm start
\`\`\`

## 配置

编辑 \`src/index.ts\` 中的配置：

- \`adapter.host\`: OneBot 服务地址
- \`adapter.port\`: OneBot 服务端口

## 开发插件

在 \`src/plugins\` 目录下创建新的插件文件。

## 许可证

MIT
`;

  await fs.writeFile(path.join(targetDir, 'README.md'), readme);
}
