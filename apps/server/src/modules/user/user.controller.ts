import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';

import { sendEmailInterface, UserLoginInterface, UserRegisterInterface } from '@triptrip/types';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('code')
  @HttpCode(HttpStatus.OK)
  @Public()
  async send(@Body() body: sendEmailInterface) {
    return await this.userService.sendVerifyCode(body.email);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Public()
  async register(@Body() body: UserRegisterInterface) {
    return await this.userService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(@Body() body: UserLoginInterface) {
    return await this.userService.login(body);
  }
}
