import { Module } from '@nestjs/common';
import { JwtUtils } from './jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { Configurations } from 'src/common/config';

@Module({
  imports: [
    JwtModule.register({
      secret: Configurations.JWT_SECRET,
      signOptions: { expiresIn: Configurations.JWT_EXPIRATION_TIME },
    }),
  ],
  providers: [JwtUtils],
  exports: [JwtUtils],
})
export class JwtUtilsModule {}
