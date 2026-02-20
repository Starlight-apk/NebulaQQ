/**
 * NebulaQQ 国际化模块
 * 
 * 支持多语言：中文、英文、俄文、西班牙文、日文、韩文等
 */

import { EventEmitter } from 'events';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 支持的语言列表
 */
export type SupportedLanguage = 'zh-CN' | 'en-US' | 'es-ES' | 'ru-RU' | 'ja-JP' | 'ko-KR';

/**
 * 语言元数据
 */
export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

/**
 * 语言包
 */
export interface LanguagePack {
  meta: LanguageMeta;
  translations: Record<string, string>;
}

/**
 * 默认语言
 */
const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN';

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English', direction: 'ltr' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', direction: 'ltr' },
  { code: 'ru-RU', name: 'Russian (Russia)', nativeName: 'Русский', direction: 'ltr' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', direction: 'ltr' }
];

/**
 * 国际化选项
 */
export interface I18nOptions {
  /** 默认语言 */
  defaultLanguage?: SupportedLanguage;
  /** 语言文件目录 */
  localeDir?: string;
  /** 回退语言 */
  fallbackLanguage?: SupportedLanguage;
}

/**
 * 国际化类
 * 
 * @example
 * ```typescript
 * const i18n = new I18n({ defaultLanguage: 'zh-CN' });
 * await i18n.load();
 * 
 * // 翻译文本
 * const text = i18n.t('hello');
 * 
 * // 带参数的翻译
 * const greeting = i18n.t('greeting', { name: 'World' });
 * 
 * // 切换语言
 * i18n.setLanguage('en-US');
 * ```
 */
export class I18n extends EventEmitter {
  private currentLanguage: SupportedLanguage;
  private fallbackLanguage: SupportedLanguage;
  private localeDir: string;
  private languagePacks: Map<SupportedLanguage, LanguagePack> = new Map();
  private loaded = false;

  constructor(options: I18nOptions = {}) {
    super();
    const {
      defaultLanguage = DEFAULT_LANGUAGE,
      localeDir = join(__dirname, 'locales'),
      fallbackLanguage = DEFAULT_LANGUAGE
    } = options;

    this.currentLanguage = defaultLanguage;
    this.localeDir = localeDir;
    this.fallbackLanguage = fallbackLanguage;
  }

  /**
   * 加载语言文件
   */
  async load(): Promise<void> {
    // 加载所有支持的语言
    for (const lang of SUPPORTED_LANGUAGES) {
      await this.loadLanguage(lang.code);
    }
    this.loaded = true;
    this.emit('loaded');
  }

  /**
   * 加载特定语言
   */
  private async loadLanguage(lang: SupportedLanguage): Promise<void> {
    const filePath = join(this.localeDir, `${lang}.json`);
    
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const pack: LanguagePack = JSON.parse(content);
        this.languagePacks.set(lang, pack);
        console.log(`[i18n] Loaded language: ${lang}`);
      } catch (error) {
        console.error(`[i18n] Failed to load language ${lang}:`, error);
      }
    } else {
      console.warn(`[i18n] Language file not found: ${filePath}`);
      // 创建默认语言包
      this.languagePacks.set(lang, this.createDefaultPack(lang));
    }
  }

  /**
   * 创建默认语言包
   */
  private createDefaultPack(lang: SupportedLanguage): LanguagePack {
    const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang)!;
    return {
      meta,
      translations: this.getDefaultTranslations(lang)
    };
  }

  /**
   * 获取默认翻译
   */
  private getDefaultTranslations(lang: SupportedLanguage): Record<string, string> {
    // 内置的基础翻译
    const translations: Record<string, Record<SupportedLanguage, string>> = {
      // 通用
      'hello': {
        'zh-CN': '你好',
        'en-US': 'Hello',
        'es-ES': 'Hola',
        'ru-RU': 'Здравствуйте',
        'ja-JP': 'こんにちは',
        'ko-KR': '안녕하세요'
      },
      'goodbye': {
        'zh-CN': '再见',
        'en-US': 'Goodbye',
        'es-ES': 'Adiós',
        'ru-RU': 'До свидания',
        'ja-JP': 'さようなら',
        'ko-KR': '안녕히 가세요'
      },
      'thank_you': {
        'zh-CN': '谢谢',
        'en-US': 'Thank you',
        'es-ES': 'Gracias',
        'ru-RU': 'Спасибо',
        'ja-JP': 'ありがとう',
        'ko-KR': '감사합니다'
      },
      'welcome': {
        'zh-CN': '欢迎',
        'en-US': 'Welcome',
        'es-ES': 'Bienvenido',
        'ru-RU': 'Добро пожаловать',
        'ja-JP': 'ようこそ',
        'ko-KR': '환영합니다'
      },
      
      // 机器人状态
      'bot_ready': {
        'zh-CN': '机器人已就绪',
        'en-US': 'Bot is ready',
        'es-ES': 'El bot está listo',
        'ru-RU': 'Бот готов',
        'ja-JP': 'ボットが準備できました',
        'ko-KR': '봇이 준비되었습니다'
      },
      'bot_starting': {
        'zh-CN': '机器人启动中...',
        'en-US': 'Bot is starting...',
        'es-ES': 'El bot está iniciando...',
        'ru-RU': 'Бот запускается...',
        'ja-JP': 'ボットを起動中...',
        'ko-KR': '봇 시작 중...'
      },
      'bot_stopped': {
        'zh-CN': '机器人已停止',
        'en-US': 'Bot is stopped',
        'es-ES': 'El bot está detenido',
        'ru-RU': 'Бот остановлен',
        'ja-JP': 'ボットが停止しました',
        'ko-KR': '봇이 중지되었습니다'
      },
      'bot_error': {
        'zh-CN': '机器人错误',
        'en-US': 'Bot error',
        'es-ES': 'Error del bot',
        'ru-RU': 'Ошибка бота',
        'ja-JP': 'ボットエラー',
        'ko-KR': '봇 오류'
      },
      
      // 消息
      'message_received': {
        'zh-CN': '收到消息',
        'en-US': 'Message received',
        'es-ES': 'Mensaje recibido',
        'ru-RU': 'Сообщение получено',
        'ja-JP': 'メッセージを受信',
        'ko-KR': '메시지 수신'
      },
      'message_sent': {
        'zh-CN': '消息已发送',
        'en-US': 'Message sent',
        'es-ES': 'Mensaje enviado',
        'ru-RU': 'Сообщение отправлено',
        'ja-JP': 'メッセージを送信',
        'ko-KR': '메시지 전송됨'
      },
      'message_failed': {
        'zh-CN': '消息发送失败',
        'en-US': 'Failed to send message',
        'es-ES': 'Error al enviar mensaje',
        'ru-RU': 'Не удалось отправить сообщение',
        'ja-JP': 'メッセージ送信失敗',
        'ko-KR': '메시지 전송 실패'
      },
      
      // 插件
      'plugin_loaded': {
        'zh-CN': '插件已加载',
        'en-US': 'Plugin loaded',
        'es-ES': 'Plugin cargado',
        'ru-RU': 'Плагин загружен',
        'ja-JP': 'プラグインを読み込みました',
        'ko-KR': '플러그인 로드됨'
      },
      'plugin_unloaded': {
        'zh-CN': '插件已卸载',
        'en-US': 'Plugin unloaded',
        'es-ES': 'Plugin descargado',
        'ru-RU': 'Плагин выгружен',
        'ja-JP': 'プラグインをアンロードしました',
        'ko-KR': '플러그인 언로드됨'
      },
      'plugin_error': {
        'zh-CN': '插件错误',
        'en-US': 'Plugin error',
        'es-ES': 'Error del plugin',
        'ru-RU': 'Ошибка плагина',
        'ja-JP': 'プラグインエラー',
        'ko-KR': '플러그인 오류'
      },
      'plugin_not_found': {
        'zh-CN': '插件未找到',
        'en-US': 'Plugin not found',
        'es-ES': 'Plugin no encontrado',
        'ru-RU': 'Плагин не найден',
        'ja-JP': 'プラグインが見つかりません',
        'ko-KR': '플러그인을 찾을 수 없음'
      },
      
      // 命令
      'command_help': {
        'zh-CN': '帮助',
        'en-US': 'Help',
        'es-ES': 'Ayuda',
        'ru-RU': 'Помощь',
        'ja-JP': 'ヘルプ',
        'ko-KR': '도움말'
      },
      'command_unknown': {
        'zh-CN': '未知命令',
        'en-US': 'Unknown command',
        'es-ES': 'Comando desconocido',
        'ru-RU': 'Неизвестная команда',
        'ja-JP': '不明なコマンド',
        'ko-KR': '알 수 없는 명령'
      },
      'command_cooldown': {
        'zh-CN': '命令冷却中，请 {seconds} 秒后再试',
        'en-US': 'Command on cooldown, please try again in {seconds} seconds',
        'es-ES': 'Comando en enfriamiento, inténtalo de nuevo en {seconds} segundos',
        'ru-RU': 'Команда на перезарядке, попробуйте через {seconds} секунд',
        'ja-JP': 'コマンドはクールダウン中です。{seconds}秒後にもう一度お試しください',
        'ko-KR': '명령어 쿨다운 중입니다. {seconds}초 후 다시 시도해주세요'
      },
      
      // 权限
      'permission_denied': {
        'zh-CN': '权限不足',
        'en-US': 'Permission denied',
        'es-ES': 'Permiso denegado',
        'ru-RU': 'Доступ запрещён',
        'ja-JP': '権限がありません',
        'ko-KR': '권한이 없습니다'
      },
      'admin_only': {
        'zh-CN': '仅管理员可用',
        'en-US': 'Admin only',
        'es-ES': 'Solo administradores',
        'ru-RU': 'Только для администраторов',
        'ja-JP': '管理者のみ利用可能',
        'ko-KR': '관리자만 사용 가능'
      },
      
      // 错误
      'error': {
        'zh-CN': '错误',
        'en-US': 'Error',
        'es-ES': 'Error',
        'ru-RU': 'Ошибка',
        'ja-JP': 'エラー',
        'ko-KR': '오류'
      },
      'warning': {
        'zh-CN': '警告',
        'en-US': 'Warning',
        'es-ES': 'Advertencia',
        'ru-RU': 'Предупреждение',
        'ja-JP': '警告',
        'ko-KR': '경고'
      },
      'info': {
        'zh-CN': '信息',
        'en-US': 'Info',
        'es-ES': 'Información',
        'ru-RU': 'Информация',
        'ja-JP': '情報',
        'ko-KR': '정보'
      },
      'debug': {
        'zh-CN': '调试',
        'en-US': 'Debug',
        'es-ES': 'Depuración',
        'ru-RU': 'Отладка',
        'ja-JP': 'デバッグ',
        'ko-KR': '디버그'
      },
      
      // 时间
      'seconds': {
        'zh-CN': '秒',
        'en-US': 'seconds',
        'es-ES': 'segundos',
        'ru-RU': 'секунд',
        'ja-JP': '秒',
        'ko-KR': '초'
      },
      'minutes': {
        'zh-CN': '分钟',
        'en-US': 'minutes',
        'es-ES': 'minutos',
        'ru-RU': 'минут',
        'ja-JP': '分',
        'ko-KR': '분'
      },
      'hours': {
        'zh-CN': '小时',
        'en-US': 'hours',
        'es-ES': 'horas',
        'ru-RU': 'часов',
        'ja-JP': '時間',
        'ko-KR': '시간'
      },
      'days': {
        'zh-CN': '天',
        'en-US': 'days',
        'es-ES': 'días',
        'ru-RU': 'дней',
        'ja-JP': '日',
        'ko-KR': '일'
      }
    };

    return Object.fromEntries(
      Object.entries(translations).map(([key, value]) => [key, value[lang]])
    );
  }

  /**
   * 设置当前语言
   */
  setLanguage(lang: SupportedLanguage): void {
    if (!SUPPORTED_LANGUAGES.find(l => l.code === lang)) {
      console.warn(`[i18n] Unsupported language: ${lang}`);
      return;
    }
    this.currentLanguage = lang;
    this.emit('languageChanged', lang);
  }

  /**
   * 获取当前语言
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * 翻译文本
   * 
   * @param key 翻译键
   * @param params 参数替换
   * @param lang 指定语言（可选）
   */
  t(key: string, params?: Record<string, string | number>, lang?: SupportedLanguage): string {
    const language = lang || this.currentLanguage;
    const pack = this.languagePacks.get(language);
    
    if (!pack) {
      return key;
    }

    let translation = pack.translations[key];

    // 如果当前语言没有该翻译，使用回退语言
    if (!translation && language !== this.fallbackLanguage) {
      const fallbackPack = this.languagePacks.get(this.fallbackLanguage);
      translation = fallbackPack?.translations[key] || key;
    }

    if (!translation) {
      return key;
    }

    // 替换参数
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      }
    }

    return translation;
  }

  /**
   * 翻译复数
   */
  tn(key: string, count: number, params?: Record<string, string | number>): string {
    const singular = this.t(`${key}_singular`, params);
    const plural = this.t(`${key}_plural`, params);
    
    return count === 1 ? singular : plural;
  }

  /**
   * 检查语言是否已加载
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 获取所有支持的语言
   */
  getSupportedLanguages(): LanguageMeta[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * 获取语言包
   */
  getLanguagePack(lang?: SupportedLanguage): LanguagePack | undefined {
    const language = lang || this.currentLanguage;
    return this.languagePacks.get(language);
  }

  /**
   * 添加自定义翻译
   */
  addTranslations(lang: SupportedLanguage, translations: Record<string, string>): void {
    const pack = this.languagePacks.get(lang);
    if (pack) {
      pack.translations = { ...pack.translations, ...translations };
    } else {
      const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang);
      if (meta) {
        this.languagePacks.set(lang, { meta, translations });
      }
    }
  }
}

/**
 * 全局 i18n 实例
 */
export const i18n = new I18n();

/**
 * 快捷翻译函数
 */
export function t(key: string, params?: Record<string, string | number>): string {
  return i18n.t(key, params);
}

export default I18n;
