import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageItem } from '@triptrip/utils';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/common/utils/prisma/prisma.service';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly openai: OpenAI;
    constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get('API_KEY'),
            baseURL: this.configService.get('BASE_URL')
        });
    }
    private readonly model = "qwen-plus";
    async getReview(pid: number): Promise<Observable<MessageItem>> {
        const passage = await this.prismaService.passage.findUnique({
            where: {
                pid
            },
            select: {
                content: true,
                title: true
            }
        });

        if (!passage) {
            throw new Error('Passage not found');
        }
        return new Observable(subscriber => {
            (async () => {
                try {

                    const completion = await this.openai.chat.completions.create({
                        model: "qwen-plus",
                        messages: [
                            { "role": "system", "content": this.systemMessage },
                            {
                                "role": "user", "content": `
                      文章标题: ${passage.title}
                      文章内容: ${passage.content}
                    ` }
                        ],
                        stream: true,
                    });
                    let index = 0;
                    for await (const chunk of completion) {
                        if (Array.isArray(chunk.choices) && chunk.choices.length > 0 && chunk.choices[0].delta.content) {
                            const message = {
                                content: chunk.choices[0].delta.content,
                                id: index++
                            };
                            this.logger.log(`AI返回内容: ${message.content}`);
                            subscriber.next(message as MessageItem);
                        }
                    }
                    subscriber.complete();
                } catch (error) {
                    this.logger.error('Streaming error:', error);
                    subscriber.error(error);
                }
            })();
        });
    }
    private readonly systemMessage = `
    - Role: 社区内容风险评审专家
    - Background: 用户需要对输入的文章进行审核评级，以确保内容符合社区规范。这涉及到对文本内容的深度分析，识别潜在的违规内容，并准确标记其位置，以便后续处理。
    - Profile: 你是一位精通自然语言处理和社区内容审核的专家，熟悉各种社区规范和语言表达方式，能够通过先进的技术手段和丰富的审核经验，精准地识别和处理违规内容。
    - Skills: 你具备强大的文本分析能力、对社区规范的深刻理解、以及精准定位文本问题的能力，能够结合系统设定的社区规范，高效地完成审核评级任务。
    - Goals: 通过结合系统设定的社区规范，对输入的文章进行审核评级，准确识别并标记可疑或违规内容的位置，确保审核结果的准确性和公正性。
    - Constrains: 审核评级必须严格依据系统设定的社区规范进行，不得主观臆断；对于可疑或违规内容，必须明确标注其在文中的起止位置，并提供足够的上下文信息以便复核。
    - OutputFormat: 输出应包含评级结果（良好、可疑、严重违反），以及可疑或违规内容的文字段落、起止位置和周围的上下文文字。
    - Workflow:
      1. 接收输入文章并进行预处理，提取文本内容。
      2. 根据系统设定的社区规范，对文章内容进行逐段分析，识别可疑或违规内容。
      3. 对于识别出的可疑或违规内容，记录其在文中的位置，并提取周围的上下文文字。
      4. 根据识别结果，对文章进行评级（良好、可疑、严重违反），并输出详细的审核报告。
    - Examples:
      - 例子1：文章内容为"这是一个和平的社区，我们欢迎所有遵守规则的人。"
        - 评级结果：良好
        - 可疑或违规内容：无
      - 例子2：文章内容为"我们在这里可以随意发表任何观点，包括攻击他人的言论。"
        - 评级结果：可疑
        - 可疑内容：攻击他人的言论
        - 位置：第2行，第12-20字
        - 上下文：我们在这里可以随意发表任何观点，包括攻击他人的言论。
      - 例子3：文章内容为"这里是一个自由的社区，你可以随意发布色情内容。"
        - 评级结果：严重违反
        - 违规内容：色情内容
        - 位置：第1行，第15-20字
        - 上下文：这里是一个自由的社区，你可以随意发布色情内容。
      - 例子4：文章内容无意义，水文等，语义混乱的，例如："123123123132123141241241爱说大话氨基酸的卡上"
        - 评级结果：严重违反
        - 可疑或违规内容：无意义的水文
    - Initialization: 在第一次对话中，请直接输出以下：您好，我是社区内容审核专家。我将根据系统设定的社区规范进行审核评级，为您列出可疑或违规内容的位置和上下文信息。
      `
} 