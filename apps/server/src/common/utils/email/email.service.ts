import { createTransport, Transporter } from 'nodemailer';
import { Configurations } from 'src/common/config';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger: Logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private verificationTemplate: string;

  // 初始化邮件传输器和模板
  onModuleInit() {
    const config = {
      host: Configurations.MAIL_HOST,
      port: Configurations.MAIL_PORT,
      auth: {
        user: Configurations.MAIL_USER,
        pass: Configurations.MAIL_PASS,
      },
    };
    this.logger.log(`Initializing email service with config: ${JSON.stringify(config)}`);
    this.transporter = createTransport(config);
    const templatePath = path.join(__dirname, '../../../template/mail.html');
    this.verificationTemplate = fs.readFileSync(templatePath, 'utf-8');
  }

  /**
   * 发送邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param content 邮件内容（支持HTML）
   */
  public async sendEmail(to: string, subject: string, content: string) {
    await this.transporter.sendMail({
      from: Configurations.MAIL_USER, // 发件人
      to, // 收件人
      subject, // 主题
      html: content, // 内容（HTML格式）
    });
  }

  /**
   * 发送验证码邮件
   * @param to 收件人邮箱
   * @param code 验证码
   */
  public async sendVerificationCode(to: string, code: string) {
    this.logger.log(`Sending verification code to ${to} with code ${code}...`);
    const subject = 'WonderLand';
    // 使用模板并替换验证码
    const content = this.verificationTemplate.replace('${code}', code);

    return await this.sendEmail(to, subject, content);
  }
}
