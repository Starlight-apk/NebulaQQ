/**
 * NebulaQQ - 主题定义
 */

/** 主题元数据 */
export interface ThemeManifest {
  /** 主题名称 */
  name: string;
  /** 主题版本 */
  version: string;
  /** 主题描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 适用场景 */
  scenarios?: string[];
}

/** 颜色配置 */
export interface ColorScheme {
  /** 主色调 */
  primary: string;
  /** 次要色调 */
  secondary: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 背景色 */
  background: string;
  /** 前景色 */
  foreground: string;
}

/** 表情符号配置 */
export interface EmojiSet {
  /** 开心 */
  happy: string[];
  /** 悲伤 */
  sad: string[];
  /** 惊讶 */
  surprised: string[];
  /** 生气 */
  angry: string[];
  /** 思考 */
  thinking: string[];
  /** 爱心 */
  love: string[];
  /** 打招呼 */
  wave: string[];
  /** 确认 */
  confirm: string[];
  /** 拒绝 */
  reject: string[];
}

/** 响应模板 */
export interface ResponseTemplate {
  /** 成功响应模板 */
  success?: string;
  /** 失败响应模板 */
  error?: string;
  /** 等待响应模板 */
  waiting?: string;
  /** 帮助响应模板 */
  help?: string;
  /** 欢迎模板 */
  welcome?: string;
  /** 告别模板 */
  goodbye?: string;
}

/** 消息样式 */
export interface MessageStyle {
  /** 消息前缀 */
  prefix?: string;
  /** 消息后缀 */
  suffix?: string;
  /** 是否显示时间戳 */
  showTimestamp?: boolean;
  /** 时间戳格式 */
  timestampFormat?: string;
  /** 是否显示发送者 */
  showSender?: boolean;
  /** 消息分隔符 */
  separator?: string;
}

/** 主题配置 */
export interface ThemeConfig {
  /** 颜色方案 */
  colors?: ColorScheme;
  /** 表情符号集 */
  emojis?: EmojiSet;
  /** 响应模板 */
  templates?: ResponseTemplate;
  /** 消息样式 */
  messageStyle?: MessageStyle;
}

/** 主题接口 */
export interface Theme {
  /** 主题元数据 */
  manifest: ThemeManifest;
  /** 主题配置 */
  config: ThemeConfig;
  /** 获取颜色 */
  getColor?: (name: keyof ColorScheme) => string;
  /** 获取表情 */
  getEmoji?: (category: keyof EmojiSet, index?: number) => string | undefined;
  /** 渲染模板 */
  renderTemplate?: (name: keyof ResponseTemplate, vars?: Record<string, string>) => string;
  /** 格式化消息 */
  formatMessage?: (message: string, options?: MessageFormatOptions) => string;
}

/** 消息格式化选项 */
export interface MessageFormatOptions {
  showTimestamp?: boolean;
  showSender?: boolean;
  senderName?: string;
  timestamp?: Date;
}

/** 定义主题的辅助函数 */
export function defineTheme(theme: Theme): Theme {
  return theme;
}

/**
 * 创建默认主题配置
 */
export function createDefaultThemeConfig(): ThemeConfig {
  return {
    colors: {
      primary: '#1E90FF',
      secondary: '#9370DB',
      success: '#32CD32',
      warning: '#FFA500',
      error: '#FF6347',
      background: '#FFFFFF',
      foreground: '#333333'
    },
    emojis: {
      happy: ['😊', '😄', '😁', '😆'],
      sad: ['😢', '😭', '😞', '😔'],
      surprised: ['😮', '😯', '😲', '😳'],
      angry: ['😠', '😡', '🤬', '😤'],
      thinking: ['🤔', '😐', '😶', '🙄'],
      love: ['❤️', '💕', '💖', '💗'],
      wave: ['👋', '👋🏻', '👋🏼', '👋🏽'],
      confirm: ['✅', '✔️', '☑️', '🆗'],
      reject: ['❌', '❎', '🚫', '✖️']
    },
    templates: {
      success: '✅ {message}',
      error: '❌ {message}',
      waiting: '⏳ {message}',
      help: '📖 {message}',
      welcome: '👋 欢迎 {user}！',
      goodbye: '👋 再见！'
    },
    messageStyle: {
      prefix: '',
      suffix: '',
      showTimestamp: true,
      timestampFormat: 'HH:mm:ss',
      showSender: false,
      separator: '\n'
    }
  };
}
