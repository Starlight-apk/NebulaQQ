/**
 * NebulaQQ WebUI Server
 * 
 * 提供 WebUI 的 HTTP 服务和 WebSocket 实时通信
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** WebUI 服务器配置 */
export interface WebUIServerConfig {
  /** 服务端口 */
  port: number;
  /** 主机地址 */
  host: string;
  /** 访问令牌 */
  token?: string;
  /** 静态文件目录 */
  staticDir?: string;
}

/**
 * WebUI 服务器
 */
export class WebUIServer {
  private config: WebUIServerConfig;
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(config: WebUIServerConfig) {
    this.config = config;
    this.app = express();
    this.httpServer = createServer(this.app);
    this.wss = new WebSocketServer({ 
      server: this.httpServer,
      path: '/ws'
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // 静态文件服务
    const staticDir = this.config.staticDir || join(__dirname, '../webui/dist');
    this.app.use(express.static(staticDir));
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // API 路由前缀
    const apiRouter = express.Router();
    
    // 验证令牌
    apiRouter.use((req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (this.config.token && token !== this.config.token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });

    // 获取状态
    apiRouter.get('/status', (req, res) => {
      res.json({
        status: 'ok',
        version: '1.0.0',
        uptime: process.uptime()
      });
    });

    // 获取插件列表
    apiRouter.get('/plugins', (req, res) => {
      res.json({
        plugins: [
          { id: '1', name: 'AI 聊天', version: '1.0.0', enabled: true },
          { id: '2', name: '群管理', version: '2.1.0', enabled: true }
        ]
      });
    });

    // 获取模块列表
    apiRouter.get('/modules', (req, res) => {
      res.json({
        modules: [
          { id: '1', name: '命令处理', version: '1.0.0', enabled: true },
          { id: '2', name: '定时任务', version: '1.1.0', enabled: true }
        ]
      });
    });

    // 获取日志
    apiRouter.get('/logs', (req, res) => {
      res.json({
        logs: [
          { time: '00:00:00', level: 'info', message: 'NebulaQQ 启动中...' },
          { time: '00:00:01', level: 'info', message: '加载插件...' }
        ]
      });
    });

    // 注册 API 路由
    this.app.use('/api', apiRouter);

    // SPA 回退
    this.app.get('*', (req, res) => {
      res.sendFile(join(__dirname, '../webui/dist/index.html'));
    });
  }

  /**
   * 设置 WebSocket
   */
  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('[WebUI] 客户端已连接');

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('[WebUI] 解析消息失败:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('[WebUI] 客户端已断开');
      });

      ws.on('error', (error) => {
        console.error('[WebUI] WebSocket 错误:', error);
        this.clients.delete(ws);
      });
    });
  }

  /**
   * 处理 WebSocket 消息
   */
  private handleMessage(ws: WebSocket, message: Record<string, unknown>): void {
    const { type, payload } = message;

    switch (type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      case 'command':
        // 处理命令执行
        console.log('[WebUI] 执行命令:', payload);
        break;
      
      default:
        console.log('[WebUI] 未知消息类型:', type);
    }
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(type: string, payload: Record<string, unknown>): void {
    const message = JSON.stringify({ type, payload });
    
    for (const client of this.clients) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    }
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.config.port, this.config.host, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[WebUI] 服务器已启动：http://${this.config.host}:${this.config.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      // 关闭所有 WebSocket 连接
      for (const client of this.clients) {
        client.close();
      }
      this.clients.clear();

      this.wss.close(() => {
        this.httpServer.close(() => {
          console.log('[WebUI] 服务器已停止');
          resolve();
        });
      });
    });
  }
}

export default WebUIServer;
