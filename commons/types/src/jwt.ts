export interface JwtPayload {
  openid: string;
  userType: number;
  iat: number;
}