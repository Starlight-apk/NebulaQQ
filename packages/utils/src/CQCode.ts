/**
 * NebulaQQ - CQ 码处理
 * 
 * 兼容 OneBot CQ 码格式
 */

/** CQ 码段接口 */
export interface CQCode {
  type: string;
  data: Record<string, string>;
}

/**
 * 转义 CQ 码文本
 */
export function escapeCQCode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;');
}

/**
 * 反转义 CQ 码文本
 */
export function unescapeCQCode(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#91;/g, '[')
    .replace(/&#93;/g, ']');
}

/**
 * 解析 CQ 码字符串
 */
export function parseCQCode(cqCode: string): CQCode | null {
  const match = cqCode.match(/^\[CQ:(\w+)(?:,([\s\S]*))?\]$/);
  
  if (!match) {
    return null;
  }

  const type = match[1];
  const dataStr = match[2] || '';
  const data: Record<string, string> = {};

  // 解析参数
  const paramRegex = /([^,=]+)=([^,]*)/g;
  let paramMatch;
  
  while ((paramMatch = paramRegex.exec(dataStr)) !== null) {
    const key = paramMatch[1].trim();
    const value = unescapeCQCode(paramMatch[2].trim());
    data[key] = value;
  }

  return { type, data };
}

/**
 * 将 CQ 码对象转换为字符串
 */
export function stringifyCQCode(cqCode: CQCode): string {
  const params = Object.entries(cqCode.data)
    .map(([key, value]) => `${key}=${escapeCQCode(value)}`)
    .join(',');

  return `[CQ:${cqCode.type}${params ? ',' : ''}${params}]`;
}

/**
 * 解析包含 CQ 码的消息
 */
export function parseMessage(message: string): (string | CQCode)[] {
  const result: (string | CQCode)[] = [];
  let currentIndex = 0;

  while (currentIndex < message.length) {
    const cqStart = message.indexOf('[CQ:', currentIndex);
    
    if (cqStart === -1) {
      // 没有更多 CQ 码，添加剩余文本
      if (currentIndex < message.length) {
        result.push(message.slice(currentIndex));
      }
      break;
    }

    // 添加 CQ 码前的文本
    if (cqStart > currentIndex) {
      result.push(message.slice(currentIndex, cqStart));
    }

    // 查找 CQ 码结束
    const cqEnd = message.indexOf(']', cqStart);
    
    if (cqEnd === -1) {
      // CQ 码未闭合，添加剩余文本
      result.push(message.slice(cqStart));
      break;
    }

    // 解析 CQ 码
    const cqCodeStr = message.slice(cqStart, cqEnd + 1);
    const cqCode = parseCQCode(cqCodeStr);
    
    if (cqCode) {
      result.push(cqCode);
    } else {
      // 解析失败，作为普通文本
      result.push(cqCodeStr);
    }

    currentIndex = cqEnd + 1;
  }

  return result;
}

/**
 * 将消息数组转换为字符串
 */
export function stringifyMessage(parts: (string | CQCode)[]): string {
  return parts.map(part => {
    if (typeof part === 'string') {
      return part;
    }
    return stringifyCQCode(part);
  }).join('');
}

/**
 * 创建 CQ 码
 */
export const CQ = {
  /** @ 某人 */
  at: (qq: string | number): CQCode => ({
    type: 'at',
    data: { qq: String(qq) }
  }),

  /** 表情 */
  face: (id: string | number): CQCode => ({
    type: 'face',
    data: { id: String(id) }
  }),

  /** 图片 */
  image: (file: string, type?: string): CQCode => ({
    type: 'image',
    data: { file, ...(type ? { type } : {}) }
  }),

  /** 语音 */
  record: (file: string): CQCode => ({
    type: 'record',
    data: { file }
  }),

  /** 视频 */
  video: (file: string): CQCode => ({
    type: 'video',
    data: { file }
  }),

  /** 链接分享 */
  share: (url: string, title: string, content?: string, image?: string): CQCode => ({
    type: 'share',
    data: { url, title, ...(content ? { content } : {}), ...(image ? { image } : {}) }
  }),

  /** 音乐分享 */
  music: (type: string, id: string): CQCode => ({
    type: 'music',
    data: { type, id }
  }),

  /** 回复 */
  reply: (id: string): CQCode => ({
    type: 'reply',
    data: { id }
  }),

  /** 戳一戳 */
  poke: (qq: string | number): CQCode => ({
    type: 'poke',
    data: { qq: String(qq) }
  })
};
