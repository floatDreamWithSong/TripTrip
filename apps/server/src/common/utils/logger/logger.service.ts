import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logDir = 'logs';
  private readonly maxLogFiles = 7; // 保留最近7天的日志
  private readonly maxFileSize = 5 * 1024 * 1024; // 设置单个日志文件最大为5MB
  private currentLogFile: string;

  constructor() {
    super();
    this.ensureLogDirectory();
    this.rotateLogFiles();
    this.setCurrentLogFile();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  private setCurrentLogFile() {
    const baseFileName = format(new Date(), 'yyyy-MM-dd');
    let index = 0;
    let fileName = `${baseFileName}.log`;

    // 如果文件已存在且大小超过限制，创建新的分片文件
    while (
      fs.existsSync(path.join(this.logDir, fileName)) &&
      fs.statSync(path.join(this.logDir, fileName)).size >= this.maxFileSize
    ) {
      index++;
      fileName = `${baseFileName}.${index}.log`;
    }

    this.currentLogFile = path.join(this.logDir, fileName);
  }

  private rotateLogFiles() {
    const files = fs
      .readdirSync(this.logDir)
      .filter((file) => file.endsWith('.log'))
      .map((file) => ({
        name: file,
        time: fs.statSync(path.join(this.logDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > this.maxLogFiles) {
      files.slice(this.maxLogFiles).forEach((file) => {
        fs.unlinkSync(path.join(this.logDir, file.name));
      });
    }
  }

  private writeLog(message: string, level: string) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    // 检查当前日志文件大小
    if (
      fs.existsSync(this.currentLogFile) &&
      fs.statSync(this.currentLogFile).size >= this.maxFileSize
    ) {
      this.setCurrentLogFile(); // 创建新的日志文件
    }

    // 检查是否需要切换到新的日期
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!this.currentLogFile.includes(today)) {
      this.rotateLogFiles();
      this.setCurrentLogFile();
    }

    fs.appendFileSync(this.currentLogFile, logMessage);
  }

  log(message: string) {
    super.log(message);
    this.writeLog(message, 'INFO');
  }

  error(message: string, trace?: string) {
    super.error(message, trace);
    this.writeLog(`${message}${trace ? `\nStack: ${trace}` : ''}`, 'ERROR');
  }

  warn(message: string) {
    super.warn(message);
    this.writeLog(message, 'WARN');
  }

  debug(message: string) {
    super.debug(message);
    this.writeLog(message, 'DEBUG');
  }

  verbose(message: string) {
    super.verbose(message);
    this.writeLog(message, 'VERBOSE');
  }
}
