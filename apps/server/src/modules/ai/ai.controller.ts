import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';
import { AiService } from './ai.service';
import { Request, Response } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';

// 定义请求体验证模式
const chatRequestSchema = z.object({
  prompt: z.string().min(1, '提示词不能为空'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  max_tokens: z.number().positive().optional(),
  stream: z.boolean().optional(),
  system: z.string().optional(),
  fastMode: z.boolean().optional(), // 非深度思考模式
});

type ChatRequest = z.infer<typeof chatRequestSchema>;

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * 流式返回AI模型回复的接口
   * @param req 请求对象
   * @param res 响应对象
   */
  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  async chatStream(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // 检查请求的Content-Type
      const contentType = req.headers['content-type'] || '';
      let body: any = null;

      // 如果是流式请求，直接从请求体获取数据
      if (contentType.includes('text/event-stream')) {
        // 从请求体中获取数据
        let data = '';
        req.on('data', (chunk) => {
          data += chunk.toString();
        });

        await new Promise<void>((resolve, reject) => {
          req.on('end', () => {
            try {
              if (data) {
                body = JSON.parse(data);
              } else {
                body = { prompt: '' }; // 设置默认值，但会在验证时失败
              }
              resolve();
            } catch (error) {
              this.logger.error(`解析请求体失败: ${error.message}`);
              res.status(400).json({ error: '无效的JSON格式' });
              reject(error);
            }
          });
        });
      } else {
        // 否则，使用标准的请求体
        body = req.body || { prompt: '' }; // 设置默认值，但会在验证时失败
      }

      // 确保body不为null
      if (!body) {
        res.status(400).json({ error: '请求体不能为空' });
        return;
      }

      // 手动验证请求体
      const validationResult = chatRequestSchema.safeParse(body);
      if (!validationResult.success) {
        res.status(400).json({ 
          error: '请求参数验证失败', 
          details: validationResult.error.format() 
        });
        return;
      }

      const validatedBody = validationResult.data;
      this.logger.log(`收到流式聊天请求: ${JSON.stringify(validatedBody)}`);
      
      // 使用新的流式聊天方法
      await this.aiService.streamChat(
        validatedBody.prompt,
        res,
        req,
        {
          model: validatedBody.model,
          temperature: validatedBody.temperature,
          top_p: validatedBody.top_p,
          max_tokens: validatedBody.max_tokens,
          system: validatedBody.system,
          fastMode: validatedBody.fastMode,
        }
      );
      // 注意：streamChat 方法会自行处理响应结束，不需要在这里调用 res.end()
    } catch (error) {
      this.logger.error(`流式聊天出错: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }
} 