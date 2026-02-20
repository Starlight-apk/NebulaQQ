/**
 * NebulaQQ - WebSocket 服务器
 */

import WebSocket, { WebSocketServer as WSServer } from 'ws';
import { EventEmitter } from 'events';
import http from 'http';

/** WebSocket 服务器配置 */
export interface WebSocketServerConfig {
  host: string;
  port: number;
  path?: string;
  token?: string;
}

/**
 * WebSocket 服务器
 */
export class WebSocketServer extends EventEmitter {
  private config: WebSocketServerConfig;
  private wss: WSServer | null = null;
  private server: http.Server | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor(config: WebSocketServerConfig) {
    super();
    this.config = config;
  }

  /**
   * 启动服务器
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 创建 HTTP 服务器用于 WebSocket 升级
      this.server = http.createServer();

      // 创建 WebSocket 服务器
      this.wss = new WSServer({
        server: this.server,
        path: this.config.path || '/ws'
      });

      this.wss.on('connection', (ws, req) => {
        this.handleConnection(ws, req);
      });

      this.server.listen(this.config.port, this.config.host, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`WebSocket 服务器已启动：ws://${this.config.host}:${this.config.port}${this.config.path || '/ws'}`);
          this.emit('start');
          resolve();
        }
      });

      this.server.on('error', (err) => {
        this.emit('error', err);
      });
    });
  }

  /**
   * 处理连接
   */
  private handleConnection(ws: WebSocket, req: http.IncomingMessage): void {
    // 验证 token
    if (this.config.token) {
      const url = new URL(req.url || '', `http://${this.config.host}:${this.config.port}`);
      const token = url.searchParams.get('token') || req.headers['authorization']?.replace('Bearer ', '');
      
      if (token !== this.config.token) {
        ws.close(4001, 'Unauthorized');
        return;
      }
    }

    this.clients.add(ws);
    console.log('WebSocket 客户端已连接');
    this.emit('connection', ws);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.emit('message', message, ws);
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error);
      }
    });

    ws.on('close', () => {
      this.clients.delete(ws);
      console.log('WebSocket 客户端已断开');
      this.emit('disconnection', ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket 错误:', error);
      this.emit('error', error);
    });
  }

  /**
   * 广播消息
   */
  broadcast(data: unknown): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * 发送消息给特定客户端
   */
  sendTo(client: WebSocket, data: unknown): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }

  /**
   * 获取连接数
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * 停止服务器
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.wss || !this.server) {
        resolve();
        return;
      }

      // 关闭所有客户端连接
      for (const client of this.clients) {
        client.close();
      }
      this.clients.clear();

      this.wss.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.server?.close((err2) => {
            if (err2) {
              reject(err2);
            } else {
              console.log('WebSocket 服务器已停止');
              this.emit('stop');
              resolve();
            }
          });
        }
      });
    });
  }
}
