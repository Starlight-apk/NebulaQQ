/**
 * NebulaQQ - HTTP 服务器
 */

import http from 'http';
import { EventEmitter } from 'events';
import { URL } from 'url';

/** HTTP 服务器配置 */
export interface HttpServerConfig {
  host: string;
  port: number;
  timeout?: number;
}

/** HTTP 请求处理器 */
export type HttpRequestHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => Promise<void> | void;

/**
 * HTTP 服务器
 */
export class HttpServer extends EventEmitter {
  private config: HttpServerConfig;
  private server: http.Server | null = null;
  private routes: Map<string, HttpRequestHandler> = new Map();
  private middlewares: Array<(req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => void> = [];

  constructor(config: HttpServerConfig) {
    super();
    this.config = config;
  }

  /**
   * 注册路由
   */
  route(method: string, path: string, handler: HttpRequestHandler): void {
    const key = `${method.toUpperCase()} ${path}`;
    this.routes.set(key, handler);
  }

  /**
   * 注册 GET 路由
   */
  get(path: string, handler: HttpRequestHandler): void {
    this.route('GET', path, handler);
  }

  /**
   * 注册 POST 路由
   */
  post(path: string, handler: HttpRequestHandler): void {
    this.route('POST', path, handler);
  }

  /**
   * 注册中间件
   */
  use(middleware: (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => void): void {
    this.middlewares.push(middleware);
  }

  /**
   * 启动服务器
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        await this.handleRequest(req, res);
      });

      this.server.setTimeout(this.config.timeout || 30000);

      this.server.listen(this.config.port, this.config.host, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`HTTP 服务器已启动：http://${this.config.host}:${this.config.port}`);
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
   * 处理请求
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${this.config.host}:${this.config.port}`);
    const key = `${req.method} ${url.pathname}`;
    const handler = this.routes.get(key);

    if (!handler) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    // 执行中间件
    let index = 0;
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await new Promise<void>((resolve) => {
          middleware(req, res, () => resolve());
        });
      }
    };

    try {
      await next();
      
      if (!res.headersSent) {
        await handler(req, res);
      }
    } catch (error) {
      console.error('HTTP 请求处理失败:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }

  /**
   * 停止服务器
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('HTTP 服务器已停止');
          this.emit('stop');
          resolve();
        }
      });
    });
  }
}
