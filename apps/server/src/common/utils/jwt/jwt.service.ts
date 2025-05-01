import { Injectable } from '@nestjs/common';
import { Configurations } from 'src/common/config';
import { JwtPayload } from '@triptrip/types';
import { JwtService } from '@nestjs/jwt';
import { CryptoUtils } from './utils';

@Injectable()
export class JwtUtils {
  constructor(private readonly jwtService: JwtService) {
    // this.jwtUtils = new JwtService({
    //   secret: Configurations.JWT_SECRET,
    //   signOptions: { expiresIn: Configurations.JWT_EXPIRATION_TIME },
    // });
  }

  sign(payload: JwtPayload): string {
    return this.jwtService.sign(
      {
        ...payload,
        openid: CryptoUtils.encrypt(payload.openid),
      },
      {
        secret: Configurations.JWT_SECRET,
        expiresIn: Configurations.JWT_EXPIRATION_TIME,
      },
    );
  }

  verify(token: string) {
    const payload = this.jwtService.verify<JwtPayload>(token, {
      secret: Configurations.JWT_SECRET,
    });
    payload.openid = CryptoUtils.decrypt(payload.openid);
    return payload;
  }
}
