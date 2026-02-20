# NebulaQQ QQ Protocol

🌌 原生 QQ 协议实现 - 不依赖 NapCat 的独立 QQ 客户端协议层

## ⚠️ 重要说明

本模块是 NebulaQQ 的核心协议层，实现了完整的 QQ 客户端协议栈，**不依赖任何第三方 QQ 客户端**。

## ✨ 特性

- 🔐 **原生协议实现** - 完全独立的 QQ 协议栈
- 📱 **多设备支持** - 支持 Phone/Pad/Watch 设备类型
- 🔑 **多种登录方式** - 密码登录、扫码登录、Token 登录
- 🔒 **完整加密** - TEA、ECDH、AES、MD5、SHA 加密支持
- 💬 **消息收发** - 私聊、群聊、临时会话
- 👥 **好友管理** - 好友列表、好友信息
- 🏠 **群管理** - 群列表、群成员、群设置
- 💓 **心跳保活** - 自动心跳、断线重连

## 🚀 快速开始

### 安装依赖

```bash
cd packages/qq-protocol
pnpm install
```

### 基本使用

```typescript
import { QQProtocol, DeviceGenerator } from '@nebulaqq/qq-protocol';

// 创建协议实例
const protocol = new QQProtocol();

// 初始化
await protocol.init({
  device: DeviceGenerator.generateDefault(),
  enableLog: true,
  logLevel: 'debug',
  dataDir: './data',
  heartbeatInterval: 30,
  reconnectInterval: 5,
  maxReconnectAttempts: 5,
  requestTimeout: 10000
});

// 监听事件
protocol.on('login.success', (data) => {
  console.log('登录成功:', data.info);
});

protocol.on('login.qrcode', (data) => {
  console.log('二维码 URL:', data.url);
  // 显示二维码...
});

protocol.on('message', (data) => {
  console.log('收到消息:', data.message);
});

// 扫码登录
await protocol.login({
  uin: '12345678',
  loginType: 'qrcode',
  autoLogin: true,
  device: DeviceGenerator.generateDefault()
});

// 发送消息
await protocol.sendMessage(
  { type: 'group', groupId: 123456 },
  [{ type: 'text', content: 'Hello World!' }]
);
```

## 📦 模块结构

```
qq-protocol/
├── src/
│   ├── core/
│   │   ├── types.ts          # 类型定义
│   │   └── QQProtocol.ts     # 协议主类
│   ├── login/
│   │   └── LoginManager.ts   # 登录管理
│   ├── encrypt/
│   │   └── Crypto.ts         # 加密算法
│   ├── packet/
│   │   └── QQPacket.ts       # 数据包编解码
│   ├── connection/
│   │   └── QQConnection.ts   # 连接管理
│   ├── utils/
│   │   └── DeviceGenerator.ts # 设备生成
│   └── index.ts              # 入口文件
```

## 🔐 加密算法

### TEA 加密
```typescript
import { TEA } from '@nebulaqq/qq-protocol';

const encrypted = TEA.encrypt(data, key);
const decrypted = TEA.decrypt(encrypted, key);
```

### ECDH 密钥交换
```typescript
import { ECDH } from '@nebulaqq/qq-protocol';

const ecdh = new ECDH();
const publicKey = ecdh.getPublicKey();
const secret = ecdh.computeSecret(otherPublicKey);
```

## 📱 设备管理

### 使用预设设备
```typescript
import { DeviceGenerator, PresetDevices } from '@nebulaqq/qq-protocol';

const device = DeviceGenerator.generate(PresetDevices.xiaomi11);
```

### 自定义设备
```typescript
const device = DeviceGenerator.generate({
  modelName: 'Custom Device',
  systemVersion: '14',
  deviceType: 'phone'
});
```

## 🎯 API 参考

### 登录相关
- `login(config)` - 登录
- `getQRCode()` - 获取二维码
- `submitQrcodeStatus(token, status)` - 提交二维码状态
- `submitSmsCode(code)` - 提交短信验证码
- `submitSlider(ticket)` - 提交滑块验证码
- `logout()` - 登出

### 消息相关
- `sendMessage(target, message)` - 发送消息
- `recallMessage(chatType, targetId, messageId)` - 撤回消息

### 好友相关
- `getFriendList()` - 获取好友列表
- `getFriendInfo(userId)` - 获取好友信息
- `handleFriendRequest(requestId, approve, remark)` - 处理好友请求

### 群相关
- `getGroupList()` - 获取群列表
- `getGroupInfo(groupId)` - 获取群信息
- `getGroupMemberList(groupId)` - 获取群成员列表
- `setGroupCard(groupId, userId, card)` - 设置群名片
- `muteMember(groupId, userId, duration)` - 禁言群成员
- `kickMember(groupId, userId, rejectForever)` - 踢出群成员
- `quitGroup(groupId)` - 退出群

## 📄 License

MIT License
