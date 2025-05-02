import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '@triptrip/types';

export const USER_TYPE = 'user_type';

export type UserTypeValidator = (user: JwtPayload) => boolean;

interface UserTypeValidatorMap {
  onlyUser: UserTypeValidator;
  onlyReviewer: UserTypeValidator;
  onlyAdmin: UserTypeValidator;
  beyondUser: UserTypeValidator;
}

const validators: UserTypeValidatorMap = {
  onlyUser: (user: JwtPayload) => user.userType === 0,
  onlyReviewer: (user: JwtPayload) => user.userType === 1,
  onlyAdmin: (user: JwtPayload) => user.userType === 2,
  beyondUser: (user: JwtPayload) => user.userType > 0,
};

export const UserType = (validator: UserTypeValidator | keyof UserTypeValidatorMap) => {
  if (typeof validator === 'string') {
    return SetMetadata(USER_TYPE, validators[validator]);
  }
  return SetMetadata(USER_TYPE, validator);
};
