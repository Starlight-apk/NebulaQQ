/**
 * NebulaQQ - 设备信息生成器
 * 生成模拟的设备信息以通过腾讯验证
 */

import { Random, MD5 } from '../encrypt/Crypto';
import type { DeviceInfo, QQClientVersion } from '../core/types';

/**
 * 设备信息生成器
 */
export class DeviceGenerator {
  /**
   * 生成默认设备信息（Android Phone）
   */
  static generateDefault(): DeviceInfo {
    return {
      guid: Random.guid(),
      modelName: 'Xiaomi MI 11',
      systemVersion: '13',
      clientVersion: {
        major: 8,
        minor: 9,
        revision: 78,
        build: 15074
      },
      deviceType: 'phone',
      vendor: 'Xiaomi',
      firmware: 'MIUI 14',
      baseStation: '',
      sim: '',
      androidId: this.generateAndroidId(),
      wifiBssid: '',
      wifiSsid: ''
    };
  }

  /**
   * 生成设备信息（可自定义）
   */
  static generate(options?: Partial<DeviceInfo>): DeviceInfo {
    const defaultDevice = this.generateDefault();
    return { ...defaultDevice, ...options };
  }

  /**
   * 生成 Android ID
   */
  private static generateAndroidId(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Random.int(0, 16));
    }
    return result;
  }

  /**
   * 生成设备序列号
   */
  static generateSerial(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Random.int(0, chars.length));
    }
    return result;
  }

  /**
   * 生成 IMEI
   */
  static generateIMEI(): string {
    let imei = '';
    for (let i = 0; i < 14; i++) {
      imei += Random.int(0, 10);
    }
    // 计算校验位
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(imei[i]);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return imei + checkDigit;
  }

  /**
   * 生成 IMSI
   */
  static generateIMSI(): string {
    // 中国移动：46000, 中国联通：46001, 中国电信：46011
    const operators = ['46000', '46001', '46011'];
    const operator = operators[Random.int(0, operators.length)];
    let imsi = operator;
    for (let i = 0; i < 10; i++) {
      imsi += Random.int(0, 10);
    }
    return imsi;
  }

  /**
   * 生成 MAC 地址
   */
  static generateMAC(): string {
    const parts: string[] = [];
    for (let i = 0; i < 6; i++) {
      parts.push(Random.int(0, 256).toString(16).padStart(2, '0'));
    }
    return parts.join(':');
  }

  /**
   * 生成 WiFi BSSID
   */
  static generateBSSID(): string {
    return this.generateMAC();
  }

  /**
   * 生成设备指纹
   */
  static generateDeviceFingerprint(device: DeviceInfo): string {
    const data = [
      device.modelName,
      device.systemVersion,
      device.firmware,
      device.vendor,
      device.androidId
    ].join('|');
    return MD5.hex(data);
  }

  /**
   * 获取设备类型字符串
   */
  static getDeviceTypeString(deviceType: DeviceInfo['deviceType']): string {
    switch (deviceType) {
      case 'phone':
        return 'Android Phone';
      case 'pad':
        return 'Android Pad';
      case 'watch':
        return 'Android Watch';
      default:
        return 'Android Phone';
    }
  }

  /**
   * 获取客户端版本字符串
   */
  static getVersionString(version: QQClientVersion): string {
    return `${version.major}.${version.minor}.${version.revision}`;
  }

  /**
   * 生成设备标识符哈希
   */
  static generateDeviceHash(device: DeviceInfo): Buffer {
    const data = Buffer.concat([
      device.guid,
      Buffer.from(device.modelName, 'utf-8'),
      Buffer.from(device.androidId, 'utf-8')
    ]);
    return MD5.hash(data);
  }
}

/**
 * 预设设备配置
 */
export const PresetDevices = {
  /** 小米 11 */
  xiaomi11: {
    modelName: 'Xiaomi MI 11',
    vendor: 'Xiaomi',
    firmware: 'MIUI 14',
    systemVersion: '13'
  },
  /** 华为 Mate 40 */
  huaweiMate40: {
    modelName: 'HUAWEI Mate 40 Pro',
    vendor: 'Huawei',
    firmware: 'EMUI 13',
    systemVersion: '13'
  },
  /** OPPO Find X5 */
  oppoFindX5: {
    modelName: 'OPPO Find X5 Pro',
    vendor: 'OPPO',
    firmware: 'ColorOS 13',
    systemVersion: '13'
  },
  /** vivo X90 */
  vivoX90: {
    modelName: 'vivo X90 Pro',
    vendor: 'vivo',
    firmware: 'OriginOS 3',
    systemVersion: '13'
  },
  /** 三星 S23 */
  samsungS23: {
    modelName: 'Samsung Galaxy S23 Ultra',
    vendor: 'Samsung',
    firmware: 'One UI 5.1',
    systemVersion: '13'
  }
};

export default DeviceGenerator;
