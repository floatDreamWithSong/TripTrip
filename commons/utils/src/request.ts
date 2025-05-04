export interface JwtPayload {
  uid: number;
  username: string;
  userType: number;
  type: number;
}
export interface BaseResponse <T>{
  code: number,
  message: string,
  data: T
}