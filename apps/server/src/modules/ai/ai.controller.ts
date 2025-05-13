import { Controller, Logger, Query, Sse, Res, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { Response, Request } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';
import { Observable } from 'rxjs';
import { Public } from 'src/common/decorators/public.decorator';

// 定义查询参数验证模式
const chatQuerySchema = z.object({
  prompt: z.string().min(1, '提示词不能为空'),
  model: z.string().optional(),
});

type ChatQuery = z.infer<typeof chatQuerySchema>;

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * 流式返回AI模型回复的接口
   * 使用SSE技术实现流式输出
   * @param query 查询参数
   */
  @Sse('chat/stream')
  async chatStream(
    @Query(new ZodValidationPipe(chatQuerySchema)) query: ChatQuery,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<Observable<{ data: string }>> {
    this.logger.log(`收到流式聊天请求: ${JSON.stringify(query)}`);

    // 创建Observable流和会话ID
    const { stream, sessionId } = this.aiService.createSseStream(query.prompt, {
      model: query.model,
    });

    // 处理客户端断开连接
    req.on('close', () => {
      this.logger.log(`客户端断开连接，结束AI对话，会话ID: ${sessionId}`);
      this.aiService.terminateStream(sessionId);
    });

    return stream;
  }
} 