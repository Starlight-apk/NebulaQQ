#!/usr/bin/env node

/**
 * NebulaQQ 宣传图生成器 - 完整版
 * 使用 Pollinations.AI 免费 API 生成所有宣传图
 */

import fs from 'fs';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 所有宣传图配置
 */
const IMAGES = [
  // 主横幅
  {
    name: 'hero-banner',
    prompt: 'Epic futuristic QQ robot framework banner, nebula galaxy background, purple and blue gradient, cyberpunk city skyline, material design 3, Arknights game aesthetic, glowing crystal elements, particle effects, bokeh, cinematic lighting, ultra detailed, digital art, 1920x600',
    width: 1920,
    height: 600,
    seed: 12345
  },
  // 特性横幅
  {
    name: 'features-showcase',
    prompt: 'Modern software framework features showcase, 8 isometric icons floating in space, plugin system, module system, theme system, web UI, TypeScript, OneBot protocol, performance optimization, Termux support, purple blue gradient, clean minimal 3d render, 1600x800',
    width: 1600,
    height: 800,
    seed: 23456
  },
  // WebUI 预览
  {
    name: 'webui-dashboard',
    prompt: 'Beautiful web dashboard UI design mockup, Material Design 3, dark theme with purple blue accents, Arknights game UI style, data visualization charts, real-time logs, plugin management panel, modern clean interface, glassmorphism, high quality, 1920x1080',
    width: 1920,
    height: 1080,
    seed: 34567
  },
  // 架构图
  {
    name: 'architecture-diagram',
    prompt: 'Professional software architecture diagram, layered structure, core event system, plugin module theme systems, OneBot adapter, network module, utils library, WebUI layer, isometric view, purple blue gradient, clean vector illustration, tech style, 1800x1200',
    width: 1800,
    height: 1200,
    seed: 45678
  },
  // 代码示例
  {
    name: 'code-example',
    prompt: 'Beautiful code editor screenshot, TypeScript code for QQ bot, syntax highlighting, dark theme, purple blue color scheme, modern IDE interface, clean code, professional programming, 1600x900',
    width: 1600,
    height: 900,
    seed: 56789
  },
  // 主题展示
  {
    name: 'themes-showcase',
    prompt: 'Three mobile app screens showing different themes, dark theme, light theme, special effects theme, Material Design 3, purple blue gradient, Arknights aesthetic, UI design mockup, 1200x800',
    width: 1200,
    height: 800,
    seed: 67890
  },
  // 性能图表
  {
    name: 'performance-chart',
    prompt: 'Performance comparison charts and graphs, bar charts, line graphs, speed metrics, memory usage, connection pool optimization, cache system, modern data visualization, purple blue colors, clean design, 1400x800',
    width: 1400,
    height: 800,
    seed: 78901
  },
  // 生态系统
  {
    name: 'ecosystem',
    prompt: 'NebulaQQ ecosystem diagram, central core with orbiting satellites, plugins, modules, themes, WebUI, community, documentation, examples, galaxy theme, purple blue gradient, isometric design, 1600x1000',
    width: 1600,
    height: 1000,
    seed: 89012
  },
  // Logo 图标
  {
    name: 'logo-icon',
    prompt: 'NebulaQQ app icon logo, galaxy nebula in circle, purple blue gradient, minimalist modern design, vector style, simple geometric, app store ready, 512x512',
    width: 512,
    height: 512,
    seed: 90123
  },
  // 社交媒体卡片
  {
    name: 'social-card',
    prompt: 'Social media share card, NebulaQQ framework announcement, modern gradient background, purple blue, key features highlights, professional design, 1200x630',
    width: 1200,
    height: 630,
    seed: 11223
  }
];

/**
 * 生成 Pollinations.AI 图片 URL
 */
function generateImageUrl(prompt, width, height, seed) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
}

/**
 * 下载图片
 */
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 下载：${outputPath}`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, { timeout: 30000 }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败：HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ 完成：${outputPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

/**
 * 生成所有图片
 */
async function generateAllImages() {
  const outputDir = join(__dirname, '..', 'assets', 'images');
  
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('\n🌌 NebulaQQ 宣传图生成器\n');
  console.log(`📁 输出目录：${outputDir}\n`);
  console.log(`📊 计划生成 ${IMAGES.length} 张图片\n`);
  
  const results = [];
  
  for (let i = 0; i < IMAGES.length; i++) {
    const config = IMAGES[i];
    const imageUrl = generateImageUrl(config.prompt, config.width, config.height, config.seed);
    const outputPath = join(outputDir, `${config.name}.png`);
    
    console.log(`[${i + 1}/${IMAGES.length}] ${config.name}`);
    
    try {
      await downloadImage(imageUrl, outputPath);
      results.push({
        name: config.name,
        path: outputPath,
        url: imageUrl,
        width: config.width,
        height: config.height,
        success: true
      });
      console.log('');
    } catch (error) {
      console.error(`❌ 失败：${error.message}\n`);
      results.push({
        name: config.name,
        error: error.message,
        success: false
      });
    }
  }
  
  // 生成结果统计
  const successCount = results.filter(r => r.success).length;
  console.log('='.repeat(60));
  console.log(`📊 生成完成：${successCount}/${IMAGES.length} 成功\n`);
  
  // 生成 Markdown 使用说明
  generateMarkdownUsage(outputDir, results.filter(r => r.success));
  
  // 生成图片索引
  generateImageIndex(outputDir, results.filter(r => r.success));
  
  return results;
}

/**
 * 生成 Markdown 使用说明
 */
function generateMarkdownUsage(outputDir, successfulResults) {
  const relativePath = outputDir.replace(join(__dirname, '..'), '.');
  
  let markdown = `# NebulaQQ 宣传图索引\n\n`;
  markdown += `本文档包含所有 NebulaQQ 项目的宣传图片资源。\n\n`;
  markdown += `## 📊 统计\n\n`;
  markdown += `- **总图片数**: ${successfulResults.length}\n`;
  markdown += `- **生成时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  markdown += `- **图片来源**: Pollinations.AI (Flux 模型)\n\n`;
  markdown += `---\n\n`;
  markdown += `## 🖼️ 图片列表\n\n`;
  
  successfulResults.forEach((r, index) => {
    markdown += `### ${index + 1}. ${r.name}\n\n`;
    markdown += `- **文件**: \`${r.name}.png\`\n`;
    markdown += `- **尺寸**: ${r.width}x${r.height}\n`;
    markdown += `- **路径**: \`${relativePath}/${r.name}.png\`\n\n`;
    markdown += `![${r.name}](${relativePath}/${r.name}.png)\n\n`;
    markdown += `---\n\n`;
  });
  
  markdown += `## 📌 在 README 中使用\n\n`;
  markdown += `\`\`\`markdown\n`;
  successfulResults.forEach(r => {
    markdown += `![${r.name}](${relativePath}/${r.name}.png)\n`;
  });
  markdown += `\`\`\`\n\n`;
  
  markdown += `## 🔄 重新生成\n\n`;
  markdown += `\`\`\`bash\nnode scripts/generate-images.js\n\`\`\`\n\n`;
  markdown += `## ℹ️ API 信息\n\n`;
  markdown += `- **服务**: [Pollinations.AI](https://pollinations.ai/)\n`;
  markdown += `- **类型**: 免费、开源、无需 API 密钥\n`;
  markdown += `- **模型**: Flux\n`;
  markdown += `- **许可**: CC0 (公共领域)\n`;
  
  fs.writeFileSync(join(outputDir, 'README.md'), markdown);
  console.log(`📝 已生成使用说明：${join(outputDir, 'README.md')}`);
}

/**
 * 生成图片索引 JSON
 */
function generateImageIndex(outputDir, successfulResults) {
  const index = {
    generated: new Date().toISOString(),
    total: successfulResults.length,
    images: successfulResults.map(r => ({
      name: r.name,
      filename: `${r.name}.png`,
      width: r.width,
      height: r.height,
      path: `./${r.name}.png`
    }))
  };
  
  fs.writeFileSync(join(outputDir, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`📋 已生成索引：${join(outputDir, 'index.json')}`);
}

// 运行
generateAllImages().catch(console.error);
