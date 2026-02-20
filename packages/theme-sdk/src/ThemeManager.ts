/**
 * NebulaQQ - 主题管理器
 * 
 * 管理主题的加载、切换、应用
 */

import { EventEmitter } from 'events';
import type { Theme, ThemeConfig, ThemeManifest, ColorScheme, EmojiSet, ResponseTemplate, MessageFormatOptions } from './Theme';
import { createDefaultThemeConfig } from './Theme';

/** 主题状态 */
export type ThemeStatus = 'inactive' | 'active';

/** 主题包装器 */
export interface ThemeWrapper {
  theme: Theme;
  status: ThemeStatus;
  activatedTime?: number;
}

/**
 * 主题管理器
 */
export class ThemeManager extends EventEmitter {
  private themes: Map<string, ThemeWrapper> = new Map();
  private activeTheme: string | null = null;
  private defaultThemeConfig = createDefaultThemeConfig();

  /**
   * 注册主题
   */
  register(theme: Theme): void {
    const name = theme.manifest.name;
    
    if (this.themes.has(name)) {
      console.warn(`主题 ${name} 已注册，跳过`);
      return;
    }

    this.themes.set(name, {
      theme,
      status: 'inactive'
    });

    console.log(`主题 ${name} 已注册`);
    this.emit('theme:registered', name);
  }

  /**
   * 激活主题
   */
  activate(name: string): boolean {
    const wrapper = this.themes.get(name);
    
    if (!wrapper) {
      console.error(`主题 ${name} 不存在`);
      return false;
    }

    // 停用当前主题
    if (this.activeTheme) {
      const currentWrapper = this.themes.get(this.activeTheme);
      if (currentWrapper) {
        currentWrapper.status = 'inactive';
      }
      this.emit('theme:deactivated', this.activeTheme);
    }

    // 激活新主题
    wrapper.status = 'active';
    wrapper.activatedTime = Date.now();
    this.activeTheme = name;

    console.log(`主题 ${name} 已激活`);
    this.emit('theme:activated', name);
    
    return true;
  }

  /**
   * 停用主题
   */
  deactivate(): boolean {
    if (!this.activeTheme) {
      return false;
    }

    const wrapper = this.themes.get(this.activeTheme);
    if (wrapper) {
      wrapper.status = 'inactive';
    }

    const deactivated = this.activeTheme;
    this.activeTheme = null;

    console.log(`主题 ${deactivated} 已停用`);
    this.emit('theme:deactivated', deactivated);
    
    return true;
  }

  /**
   * 获取当前激活的主题
   */
  getActiveTheme(): Theme | null {
    if (!this.activeTheme) return null;
    return this.themes.get(this.activeTheme)?.theme || null;
  }

  /**
   * 获取颜色
   */
  getColor(name: keyof ColorScheme): string {
    const theme = this.getActiveTheme();
    
    if (theme?.getColor) {
      return theme.getColor(name);
    }
    
    return theme?.config.colors?.[name] || this.defaultThemeConfig.colors?.[name] || '#000000';
  }

  /**
   * 获取表情
   */
  getEmoji(category: keyof EmojiSet, index?: number): string {
    const theme = this.getActiveTheme();
    
    if (theme?.getEmoji) {
      const emoji = theme.getEmoji(category, index);
      if (emoji) return emoji;
    }
    
    const emojis = theme?.config.emojis?.[category] || this.defaultThemeConfig.emojis?.[category] || [];
    const idx = index !== undefined ? index % emojis.length : Math.floor(Math.random() * emojis.length);
    return emojis[idx] || '';
  }

  /**
   * 渲染模板
   */
  renderTemplate(name: keyof ResponseTemplate, vars?: Record<string, string>): string {
    const theme = this.getActiveTheme();
    
    if (theme?.renderTemplate) {
      return theme.renderTemplate(name, vars);
    }
    
    let template = theme?.config.templates?.[name] || this.defaultThemeConfig.templates?.[name] || '{message}';
    
    if (vars) {
      for (const [key, value] of Object.entries(vars)) {
        template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }
    
    return template;
  }

  /**
   * 格式化消息
   */
  formatMessage(message: string, options?: MessageFormatOptions): string {
    const theme = this.getActiveTheme();
    
    if (theme?.formatMessage) {
      return theme.formatMessage(message, options);
    }
    
    const style = theme?.config.messageStyle || this.defaultThemeConfig.messageStyle || {};
    let result = '';
    
    // 添加前缀
    if (style.prefix) {
      result += style.prefix;
    }
    
    // 添加发送者
    if (options?.showSender || style.showSender) {
      result += `[${options?.senderName || 'Unknown'}] `;
    }
    
    // 添加时间戳
    if (options?.showTimestamp || style.showTimestamp) {
      const format = style.timestampFormat || 'HH:mm:ss';
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      result += `[${time}] `;
    }
    
    // 添加消息内容
    result += message;
    
    // 添加后缀
    if (style.suffix) {
      result += style.suffix;
    }
    
    return result;
  }

  /**
   * 获取主题
   */
  get(name: string): Theme | undefined {
    return this.themes.get(name)?.theme;
  }

  /**
   * 获取主题状态
   */
  getStatus(name: string): ThemeStatus | undefined {
    return this.themes.get(name)?.status;
  }

  /**
   * 获取所有主题
   */
  getAll(): Theme[] {
    return Array.from(this.themes.values()).map(w => w.theme);
  }

  /**
   * 获取主题列表
   */
  list(): Array<{ name: string; version: string; status: ThemeStatus; description?: string }> {
    return Array.from(this.themes.values()).map(w => ({
      name: w.theme.manifest.name,
      version: w.theme.manifest.version,
      status: w.status,
      description: w.theme.manifest.description
    }));
  }

  /**
   * 获取当前激活的主题名称
   */
  getActiveThemeName(): string | null {
    return this.activeTheme;
  }
}
