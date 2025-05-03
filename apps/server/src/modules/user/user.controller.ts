import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

import { Public } from 'src/common/decorators/public.decorator';
import { UserLogin, userLoginSchema, UserRegister, userRegisterSchema } from '@triptrip/utils';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';


@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('code')
  @HttpCode(HttpStatus.OK)
  @Public()
  async send(@Body('email', ZodValidationPipe.emailSchema) email: string) {
    return await this.userService.sendVerifyCode(email);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Public()
  async register(@Body(ZodValidationPipe.userRegisterSchema) body: UserRegister) {
    return await this.userService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(@Body(ZodValidationPipe.userLoginSchema) body: UserLogin) {
    return await this.userService.login(body);
  }
  @Get('info')
  @Public()
  async info(@Query('uid', ParseIntPipe) uid: number) {
    return await this.userService.info(uid);
  }
}
