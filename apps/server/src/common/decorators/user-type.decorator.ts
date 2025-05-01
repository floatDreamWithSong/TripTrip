import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '@triptrip/types';

export const USER_TYPE = 'user_type';

export type UserTypeValidator = (user: JwtPayload) => boolean;

interface UserTypeValidatorMap {
  onlyUnAuthedUser: UserTypeValidator;
  onlyAuthedUser: UserTypeValidator;
}

const validators: UserTypeValidatorMap = {
  onlyUnAuthedUser: (user: JwtPayload) => user.userType === 0,
  onlyAuthedUser: (user: JwtPayload) => user.userType === 1,
};

export const UserType = (validator: UserTypeValidator | keyof UserTypeValidatorMap) => {
  if (typeof validator === 'string') {
    return SetMetadata(USER_TYPE, validators[validator]);
  }
  return SetMetadata(USER_TYPE, validator);
};
