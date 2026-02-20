#!/usr/bin/env node

/**
 * NebulaQQ 宣传图生成器
 * 使用 Pollinations.AI 免费 API 生成项目宣传图
 */

import fs from 'fs';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 宣传图配置
 */
const PROMPTS = [
  {
    name: 'banner-main',
    prompt: 'Futuristic QQ robot framework logo, nebula galaxy theme, purple and blue gradient, cyberpunk style, material design, Arknights aesthetic, crystal elements, glowing effects, high quality, digital art, 1920x1080',
    width: 1920,
    height: 1080,
    description: '主横幅'
  },
  {
    name: 'banner-features',
    prompt: 'Modern software framework features illustration, plugin system, module system, theme system icons, isometric design, purple blue gradient, futuristic technology style, clean minimal, 3d render, 1200x630',
    width: 1200,
    height: 630,
    description: '功能特性图'
  },
  {
    name: 'icon-logo',
    prompt: 'NebulaQQ logo icon, galaxy nebula in circle, purple blue gradient, minimalist modern design, app icon, vector style, simple geometric, 512x512',
    width: 512,
    height: 512,
    description: 'Logo 图标'
  },
  {
    name: 'webui-preview',
    prompt: 'Modern web dashboard UI design, Material Design 3, dark theme, purple blue accent colors, Arknights game aesthetic, clean interface, data visualization, analytics dashboard, high quality mockup, 1920x1080',
    width: 1920,
    height: 1080,
    description: 'WebUI 预览图'
  },
  {
    name: 'architecture-diagram',
    prompt: 'Software architecture diagram, modern clean design, purple blue gradient, isometric view, microservices, cloud native, futuristic technology, minimal vector illustration, 1600x900',
    width: 1600,
    height: 900,
    description: '架构图'
  }
];

/**
 * 生成 Pollinations.AI 图片 URL
 */
function generateImageUrl(prompt, width, height, seed = Math.floor(Math.random() * 10000)) {
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
    
    https.get(url, (response) => {
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
 * 生成所有宣传图
 */
async function generateAllImages() {
  const outputDir = join(__dirname, 'assets', 'images');
  
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🌌 NebulaQQ 宣传图生成器\n');
  console.log(`📁 输出目录：${outputDir}\n`);
  
  const results = [];
  
  for (const config of PROMPTS) {
    const imageUrl = generateImageUrl(config.prompt, config.width, config.height);
    const outputPath = join(outputDir, `${config.name}.png`);
    
    try {
      await downloadImage(imageUrl, outputPath);
      results.push({
        name: config.name,
        description: config.description,
        path: outputPath,
        url: imageUrl,
        success: true
      });
    } catch (error) {
      console.error(`❌ 失败：${config.name} - ${error.message}`);
      results.push({
        name: config.name,
        description: config.description,
        error: error.message,
        success: false
      });
    }
  }
  
  console.log('\n📊 生成结果：');
  console.log('='.repeat(50));
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.description} (${r.name})`);
  });
  
  // 生成 Markdown 使用说明
  generateMarkdownUsage(outputDir, results.filter(r => r.success));
  
  return results;
}

/**
 * 生成 Markdown 使用说明
 */
function generateMarkdownUsage(outputDir, successfulResults) {
  const relativePath = outputDir.replace(join(__dirname, '..'), '.');
  
  const markdown = `# NebulaQQ 宣传图使用说明

## 生成的图片

${successfulResults.map(r => `### ${r.description}

- **文件名**: \`${r.name}.png\`
- **路径**: \`${relativePath}/${r.name}.png\`
- **尺寸**: 根据配置自动生成

![${r.description}](${relativePath}/${r.name}.png)

---
`).join('\n')}

## 在 README 中使用

### 主横幅

\`\`\`markdown
![NebulaQQ Banner](./assets/images/banner-main.png)
\`\`\`

### 功能特性

\`\`\`markdown
![Features](./assets/images/banner-features.png)
\`\`\`

### WebUI 预览

\`\`\`markdown
![WebUI Preview](./assets/images/webui-preview.png)
\`\`\`

## 重新生成

\`\`\`bash
node scripts/generate-images.js
\`\`\`

## 注意事项

1. 图片由 Pollinations.AI 生成（免费、开源）
2. 每次运行会生成不同的随机图片
3. 图片尺寸已优化用于 GitHub 展示
4. 建议选择合适的图片后固定使用

## API 信息

- **服务**: Pollinations.AI
- **类型**: 免费、无需 API 密钥
- **模型**: Flux
- **文档**: https://pollinations.ai/
`;

  fs.writeFileSync(join(outputDir, 'README.md'), markdown);
  console.log(`\n📝 已生成使用说明：${join(outputDir, 'README.md')}`);
}

// 运行
generateAllImages().catch(console.error);
