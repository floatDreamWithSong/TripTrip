import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, Subject, from, map, catchError, throwError } from 'rxjs';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// 修改为符合DOM标准的MessageEvent接口
interface MessageEvent {
  data: string;
  type?: string;
  lastEventId?: string;
}

// 定义流会话接口
interface StreamSession {
  stream: any;
  subject: Subject<MessageEvent>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl = 'http://localhost:11434'; // Ollama默认URL
  private activeSessions = new Map<string, StreamSession>(); // 存储所有活跃的会话

  constructor(private readonly httpService: HttpService) {}

  /**
   * 创建SSE流
   * @param prompt 用户输入的提示词
   * @param options 可选参数
   * @returns Observable<MessageEvent> 和 会话ID
   */
  createSseStream(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      system?: string;
      fastMode?: boolean;
    } = {}
  ): { stream: Observable<MessageEvent>; sessionId: string } {
    const sessionId = uuidv4(); // 生成唯一会话ID
    const subject = new Subject<MessageEvent>();
    
    // 构建请求体
    const model = options.model || 'deepseek-r1:7b';
    const temperature = options.temperature || 0.7;
    const top_p = options.top_p || 0.9;
    const max_tokens = options.max_tokens || 2048;
    
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

    // 发送请求到Ollama
    this.httpService
      .post(`${this.ollamaUrl}/api/generate`, requestBody, {
        responseType: 'stream',
      })
      .pipe(
        catchError(error => {
          this.logger.error(`与Ollama通信失败: ${error.message}`);
          subject.error(error);
          this.cleanupSession(sessionId);
          return throwError(() => new Error(`与AI模型通信失败: ${error.message}`));
        })
      )
      .subscribe({
        next: response => {
          const stream = response.data;
          
          // 保存会话
          this.activeSessions.set(sessionId, { stream, subject });
          
          // 处理数据流
          stream.on('data', (chunk: Buffer) => {
            try {
              const text = chunk.toString('utf-8');
              // Ollama的响应格式为JSON行，每行是一个JSON对象
              const lines = text.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                    console.log(line);
                  const data = JSON.parse(line);
                  // 发送数据到客户端
                  subject.next(data);
                } catch (e) {
                  this.logger.warn(`无法解析JSON行: ${line}`);
                }
              }
            } catch (e) {
              this.logger.error(`处理流数据出错: ${e.message}`);
              subject.error(e);
              this.cleanupSession(sessionId);
            }
          });

          // 处理流结束
          stream.on('end', () => {
            subject.next({ data: JSON.stringify({ done: true }) });
            subject.complete();
            this.cleanupSession(sessionId);
          });

          // 处理流错误
          stream.on('error', (err) => {
            this.logger.error(`流错误: ${err.message}`);
            subject.error(err);
            this.cleanupSession(sessionId);
          });
        },
        error: (error) => {
          this.logger.error(`请求错误: ${error.message}`);
          subject.error(error);
          this.cleanupSession(sessionId);
        }
      });

    return { 
      stream: subject.asObservable(),
      sessionId
    };
  }

  /**
   * 终止指定的流式对话
   * @param sessionId 会话ID
   */
  terminateStream(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      this.logger.warn(`尝试终止不存在的会话: ${sessionId}`);
      return;
    }

    this.logger.log(`终止会话: ${sessionId}`);
    
    try {
      // 尝试中止底层HTTP请求
      const stream = session.stream;
      if (stream.destroy && typeof stream.destroy === 'function') {
        stream.destroy();
      } else if (stream.abort && typeof stream.abort === 'function') {
        stream.abort();
      }
    } catch (error) {
      this.logger.error(`终止流失败: ${error.message}`);
    }
    
    // 完成并清理Subject
    session.subject.next({ data: JSON.stringify({ done: true, terminated: true }) });
    session.subject.complete();
    
    // 从Map中删除会话
    this.activeSessions.delete(sessionId);
  }

  /**
   * 清理会话资源
   * @param sessionId 会话ID
   */
  private cleanupSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    this.logger.log(`会话已清理: ${sessionId}`);
  }
} 