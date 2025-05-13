import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';

import { Public } from 'src/common/decorators/public.decorator';
import { JwtPayload, UserForgetPassword, UserLogin, UserRegister, UserUpdateEmail, UserUpdateInfo, UserUpdatePassword } from '@triptrip/utils';
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipe';
import { User } from 'src/common/decorators/user.decorator';
import { VERIFICATION_CODE_POSTFIX } from 'src/common/constants';
import { UploadFilter } from 'src/common/utils/upload/upload.filter';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';


@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('code/register')
  @HttpCode(HttpStatus.OK)
  @Public()
  async sendRegisterVerifyCode(@Body('email', ZodValidationPipe.emailSchema) email: string) {
    return await this.userService.sendVerifyCode(email, VERIFICATION_CODE_POSTFIX.USER_REGISTER);
  }
  @Post('code/forget')
  @HttpCode(HttpStatus.OK)
  async sendForgetVerifyCode(@Body('email', ZodValidationPipe.emailSchema) email: string) {
    return await this.userService.sendVerifyCode(email, VERIFICATION_CODE_POSTFIX.USER_FORGET_PASSWORD);
  }
  @Post('code/email')
  @HttpCode(HttpStatus.OK)
  async sendUpdateEmailVerifyCode(@Body('email', ZodValidationPipe.emailSchema) email: string) {
    return await this.userService.sendVerifyCode(email, VERIFICATION_CODE_POSTFIX.USER_UPDATE_EMAIL);
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
    return await this.userService.publicInfo(uid);
  }
  @Get('self')
  async self(@User() user: JwtPayload){
    return await this.userService.privateInfo(user.uid)
  }
  @Put('info')
  async updateInfo(@Body(ZodValidationPipe.userUpdateInfoSchema) body: UserUpdateInfo, @User() user: JwtPayload) {
    return await this.userService.updateInfo({...body, uid: user.uid});
  }
  @Put('password')
  async updatePassword(@Body(ZodValidationPipe.userUpdatePasswordSchema) body: UserUpdatePassword, @User() user: JwtPayload) {
    return await this.userService.updatePassword({...body, uid: user.uid});
  }
  @Put('email')
  async updateEmail(@Body(ZodValidationPipe.userUpdateEmailSchema) body: UserUpdateEmail, @User() user: JwtPayload) {
    return await this.userService.updateEmail({...body, uid: user.uid});
  }
  @Put('forget')
  async forgetPassword(@Body(ZodValidationPipe.userForgetPasswordSchema) body: UserForgetPassword, @User() user: JwtPayload) {
    return await this.userService.forgetPassword({...body, uid: user.uid});
  }
  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    fileFilter: (req, file, callback) => UploadFilter.fileFilter(file.fieldname, file, callback)
  }))
  async updateAvatar(@UploadedFile() file: Express.Multer.File, @User() user: JwtPayload) {
    return await this.userService.updateAvatar(file, user.uid);
  }

}
