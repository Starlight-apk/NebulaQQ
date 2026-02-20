# NebulaQQ WebUI 玻璃拟态主题

🌌 为 NebulaQQ 打造的现代化 WebUI 主题，采用毛玻璃 + 拟态 + 3D 效果设计

## ✨ 特性

- 🎨 **毛玻璃效果** - 现代感十足的玻璃态设计
- 🔷 **拟态风格** - 柔和的阴影和立体感
- 🎯 **3D 交互** - 卡片悬停 3D 效果
- 🎬 **流畅动画** - 元素进入/退出动画
- 🌙 **深色/浅色** - 双主题支持
- 📱 **响应式** - 完美适配各种屏幕

## 🚀 快速开始

### 安装依赖

```bash
cd packages/webui-theme-glass
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

访问 http://localhost:5174

### 生产构建

```bash
pnpm run build
```

## 📦 组件

### 基础组件

- `GlassCard` - 毛玻璃卡片组件
- `GlassButton` - 毛玻璃按钮组件

### 布局组件

- `Sidebar` - 侧边导航栏
- `Header` - 顶部导航栏

### 视图组件

- `Dashboard` - 仪表盘
- `Plugins` - 插件管理
- `Modules` - 模块管理
- `Themes` - 主题设置
- `Settings` - 系统配置

## 🎨 自定义

### CSS 变量

```css
:root {
  --color-primary: #a2d2ff;
  --color-secondary: #e94560;
  --bg-primary: #0f0c29;
  /* 更多变量见 src/styles/variables.scss */
}
```

### 主题切换

```typescript
// 切换到浅色主题
document.documentElement.setAttribute('data-theme', 'light');
```

## 📁 目录结构

```
webui-theme-glass/
├── src/
│   ├── components/
│   │   ├── common/        # 通用组件
│   │   ├── layout/        # 布局组件
│   │   └── ...
│   ├── styles/
│   │   ├── variables.scss # CSS 变量
│   │   ├── mixins.scss    # SCSS Mixins
│   │   └── global.scss    # 全局样式
│   ├── views/             # 页面视图
│   ├── composables/       # 组合式函数
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Vite - 下一代前端构建工具
- TypeScript - JavaScript 的超集
- SCSS - CSS 预处理器
- Pinia - Vue 状态管理
- Vue Router - 官方路由管理器

## 📄 License

MIT License
