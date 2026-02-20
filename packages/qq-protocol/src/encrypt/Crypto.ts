/**
 * NebulaQQ - 加密模块
 * 实现 TEA、ECDH 等加密算法
 */

import * as crypto from 'crypto';

/**
 * TEA 加密/解密
 */
export class TEA {
  private static readonly DELTA = 0x9e3779b9;

  /**
   * TEA 加密
   */
  static encrypt(buffer: Buffer, key: Buffer): Buffer {
    const n = Math.ceil(buffer.length / 8) * 8;
    const padded = Buffer.alloc(n);
    buffer.copy(padded);

    const result = Buffer.alloc(n);
    for (let i = 0; i < n; i += 8) {
      const block = padded.slice(i, i + 8);
      const encrypted = this.encryptBlock(block, key);
      encrypted.copy(result, i);
    }
    return result;
  }

  /**
   * TEA 解密
   */
  static decrypt(buffer: Buffer, key: Buffer): Buffer {
    const n = buffer.length;
    const result = Buffer.alloc(n);

    for (let i = 0; i < n; i += 8) {
      const block = buffer.slice(i, i + 8);
      const decrypted = this.decryptBlock(block, key);
      decrypted.copy(result, i);
    }
    return result;
  }

  /**
   * TEA 加密单个块（8 字节）
   */
  private static encryptBlock(block: Buffer, key: Buffer): Buffer {
    let v0 = block.readUInt32BE(0);
    let v1 = block.readUInt32BE(4);
    const k0 = key.readUInt32BE(0);
    const k1 = key.readUInt32BE(4);
    const k2 = key.readUInt32BE(8);
    const k3 = key.readUInt32BE(12);

    let sum = 0;
    for (let i = 0; i < 32; i++) {
      sum = (sum + this.DELTA) >>> 0;
      v0 = (v0 + (((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >>> 5) + k1))) >>> 0;
      v1 = (v1 + (((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >>> 5) + k3))) >>> 0;
    }

    const result = Buffer.alloc(8);
    result.writeUInt32BE(v0, 0);
    result.writeUInt32BE(v1, 4);
    return result;
  }

  /**
   * TEA 解密单个块（8 字节）
   */
  private static decryptBlock(block: Buffer, key: Buffer): Buffer {
    let v0 = block.readUInt32BE(0);
    let v1 = block.readUInt32BE(4);
    const k0 = key.readUInt32BE(0);
    const k1 = key.readUInt32BE(4);
    const k2 = key.readUInt32BE(8);
    const k3 = key.readUInt32BE(12);

    let sum = (0x9e3779b9 * 32) >>> 0;
    for (let i = 0; i < 32; i++) {
      v1 = (v1 - (((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >>> 5) + k3))) >>> 0;
      v0 = (v0 - (((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >>> 5) + k1))) >>> 0;
      sum = (sum - this.DELTA) >>> 0;
    }

    const result = Buffer.alloc(8);
    result.writeUInt32BE(v0, 0);
    result.writeUInt32BE(v1, 4);
    return result;
  }
}

/**
 * ECDH 密钥交换
 */
export class ECDH {
  private static readonly CURVE = 'prime256v1';
  
  private privateKey: crypto.ECDH;
  private publicKey: Buffer;

  constructor() {
    this.privateKey = crypto.createECDH(ECDH.CURVE);
    this.privateKey.generateKeys();
    this.publicKey = this.privateKey.getPublicKey();
  }

  /**
   * 获取公钥
   */
  getPublicKey(): Buffer {
    return this.publicKey;
  }

  /**
   * 计算共享密钥
   */
  computeSecret(otherPublicKey: Buffer): Buffer {
    return this.privateKey.computeSecret(otherPublicKey);
  }

  /**
   * 从原始公钥创建 ECDH 实例
   */
  static fromPublicKey(publicKey: Buffer): ECDH {
    const ecdh = crypto.createECDH(ECDH.CURVE);
    ecdh.setPublicKey(publicKey);
    const instance = new ECDH();
    (instance as any).privateKey = ecdh;
    return instance;
  }
}

/**
 * MD5 工具
 */
export class MD5 {
  /**
   * 计算 MD5
   */
  static hash(data: Buffer | string): Buffer {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data;
    return crypto.createHash('md5').update(buffer).digest();
  }

  /**
   * 计算 MD5 十六进制字符串
   */
  static hex(data: Buffer | string): string {
    return this.hash(data).toString('hex');
  }
}

/**
 * SHA 工具
 */
export class SHA {
  /**
   * SHA1 哈希
   */
  static sha1(data: Buffer | string): Buffer {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data;
    return crypto.createHash('sha1').update(buffer).digest();
  }

  /**
   * SHA256 哈希
   */
  static sha256(data: Buffer | string): Buffer {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data;
    return crypto.createHash('sha256').update(buffer).digest();
  }

  /**
   * HMAC-SHA1
   */
  static hmacSha1(key: Buffer, data: Buffer): Buffer {
    return crypto.createHmac('sha1', key).update(data).digest();
  }

  /**
   * HMAC-SHA256
   */
  static hmacSha256(key: Buffer, data: Buffer): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }
}

/**
 * AES 加密
 */
export class AES {
  /**
   * AES-128-ECB 加密
   */
  static encryptECB(data: Buffer, key: Buffer): Buffer {
    const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
    const encrypted = cipher.update(data);
    const final = cipher.final();
    return Buffer.concat([encrypted, final]);
  }

  /**
   * AES-128-ECB 解密
   */
  static decryptECB(data: Buffer, key: Buffer): Buffer {
    const decipher = crypto.createDecipheriv('aes-128-ecb', key, null);
    const decrypted = decipher.update(data);
    const final = decipher.final();
    return Buffer.concat([decrypted, final]);
  }

  /**
   * AES-128-CBC 加密
   */
  static encryptCBC(data: Buffer, key: Buffer, iv: Buffer): Buffer {
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    const encrypted = cipher.update(data);
    const final = cipher.final();
    return Buffer.concat([encrypted, final]);
  }

  /**
   * AES-128-CBC 解密
   */
  static decryptCBC(data: Buffer, key: Buffer, iv: Buffer): Buffer {
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    const decrypted = decipher.update(data);
    const final = decipher.final();
    return Buffer.concat([decrypted, final]);
  }
}

/**
 * 随机数生成
 */
export class Random {
  /**
   * 生成随机字节
   */
  static bytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * 生成随机整数（范围 [min, max)）
   */
  static int(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * 生成随机设备 GUID
   */
  static guid(): Buffer {
    const guid = this.bytes(16);
    // 设置版本号为 4（随机）
    guid[6] = (guid[6] & 0x0f) | 0x40;
    // 设置变体为 1
    guid[8] = (guid[8] & 0x3f) | 0x80;
    return guid;
  }
}
