export interface JwtPayload {
  uid: number;
  userType: number;
  type: string;
  iat: number;
}