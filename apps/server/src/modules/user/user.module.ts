import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CosModule } from '../../common/utils/cos/cos.module';
import { EmailModule } from 'src/common/utils/email/email.module';
import { JwtUtilsModule } from 'src/common/utils/jwt/jwt.module';

@Module({
  imports: [CosModule, EmailModule, JwtUtilsModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
