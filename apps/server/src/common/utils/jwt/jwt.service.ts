import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Configurations } from 'src/common/config';
import { JwtPayload } from '@triptrip/types';
import { JwtService } from '@nestjs/jwt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtUtils {
  private readonly logger = new Logger(JwtUtils.name);
  constructor(private readonly jwtService: JwtService) {}

  generateTokenPair(payload: JwtPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      {
        ...payload,
        type: 'access',
      },
      {
        secret: Configurations.JWT_SECRET,
        expiresIn: Configurations.ACCESS_TOKEN_EXPIRATION_TIME,
      },
    );
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      {
        ...payload,
        type: 'refresh',
      },
      {
        secret: Configurations.JWT_SECRET,
        expiresIn: Configurations.REFRESH_TOKEN_EXPIRATION_TIME,
      },
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = this.jwtService.verify<JwtPayload & { type: string }>(token, {
        secret: Configurations.JWT_SECRET,
      });
      
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
    } catch (error) {
      this.logger.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = this.jwtService.verify<JwtPayload & { type: string }>(token, {
        secret: Configurations.JWT_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
    } catch (error) {
      this.logger.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  refreshTokens(refreshToken: string): TokenPair {
    const payload = this.verifyRefreshToken(refreshToken);
    // 注意： 这里实际会多出来iat和exp字段导致新签发失败，所以需要过滤
    return this.generateTokenPair({
      uid: payload.uid,
      username: payload.username,
      userType: payload.userType,
      type: payload.type,
    });
  }
}
