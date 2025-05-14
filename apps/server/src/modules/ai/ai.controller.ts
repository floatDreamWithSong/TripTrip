import { Controller, Logger, Query, Sse, Res, Req, Post, ParseIntPipe } from '@nestjs/common';
import { AiService } from './ai.service';
import { Observable } from 'rxjs';
import { UserType } from 'src/common/decorators/user-type.decorator';
import { MessageItem } from '@triptrip/utils';


@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly aiService: AiService) { }

  @Sse('chat/stream')
  @UserType('beyondUser')
  async test(@Query('passageId', ParseIntPipe) passageId: number): Promise<Observable<MessageItem>> {

    this.logger.log(`AI查询passageId: ${passageId} 的内容`);
    return this.aiService.getReview(passageId);
  }

} 