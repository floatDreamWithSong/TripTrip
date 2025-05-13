import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { Response, Request } from 'express';
import { map } from 'rxjs/operators';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl = 'http://localhost:11434'; // Ollama默认URL

  constructor(private readonly httpService: HttpService) {}

  /**
   * 流式对话，直接将响应流式传输到客户端
   * @param prompt 用户输入的提示词
   * @param res Express响应对象
   * @param req Express请求对象
   * @param options 可选参数
   */
  async streamChat(
    prompt: string,
    res: Response,
    req: Request,
    options: {
      model?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      system?: string;
      fastMode?: boolean;
    } = {}
  ) {
    try {
      const model = options.model || 'deepseek-r1:7b';
      const temperature = options.temperature || 0.7;
      const top_p = options.top_p || 0.9;
      const max_tokens = options.max_tokens || 2048;
      
      // 构建请求体
      const requestBody: any = {
        model,
        prompt,
        temperature,
        top_p,
        max_tokens,
        stream: true, // 强制设置为流式
      };

      // 如果提供了系统提示词，则添加到请求中
      if (options.system) {
        requestBody.system = options.system;
      } 
      // 如果启用了快速模式（非深度思考模式），则添加特定的系统提示词
      else if (options.fastMode) {
        requestBody.system = "你是一个高效助手，请直接给出答案，无需思考过程。回答要简洁明了，不要有任何的思考过程。";
      }

      // 设置响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // 立即发送头部

      // 创建一个可观察对象来处理流式响应
      const observable = this.httpService.post(`${this.ollamaUrl}/api/generate`, requestBody, {
        responseType: 'stream',
      });

      // 订阅可观察对象
      const subscription = observable.subscribe({
        next: (response) => {
          const stream = response.data;
          
          // 处理数据流
          stream.on('data', (chunk: Buffer) => {
            try {
              const text = chunk.toString('utf-8');
              // Ollama的响应格式为JSON行，每行是一个JSON对象
              const lines = text.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  // 发送数据到客户端
                  res.write(`data: ${JSON.stringify(data)}\n\n`);
                } catch (e) {
                  this.logger.warn(`无法解析JSON行: ${line}`);
                }
              }
            } catch (e) {
              this.logger.error(`处理流数据出错: ${e.message}`);
            }
          });

          // 处理流结束
          stream.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
            subscription.unsubscribe();
          });

          // 处理流错误
          stream.on('error', (err) => {
            this.logger.error(`流错误: ${err.message}`);
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
            subscription.unsubscribe();
          });
        },
        error: (error) => {
          this.logger.error(`请求错误: ${error.message}`);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
      });

      // 当请求被客户端中断时清理资源
      req.on('close', () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        if (!res.writableEnded) {
          res.end();
        }
      });
    } catch (error) {
      this.logger.error(`流式聊天出错: ${error.message}`);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
} 