import { SetMetadata } from '@nestjs/common';
import { JwtPayload, USER_TYPE } from '@triptrip/utils';

export const META_USER_TYPE = 'user_type';

export type UserTypeValidator = (user: JwtPayload) => boolean;

interface UserTypeValidatorMap {
  onlyUser: UserTypeValidator;
  onlyReviewer: UserTypeValidator;
  onlyAdmin: UserTypeValidator;
  beyondUser: UserTypeValidator;
}

const validators: UserTypeValidatorMap = {
  onlyUser: (user: JwtPayload) => user.userType === USER_TYPE.USER,
  onlyReviewer: (user: JwtPayload) => user.userType === USER_TYPE.REVIEWER,
  onlyAdmin: (user: JwtPayload) => user.userType === USER_TYPE.ADMIN,
  beyondUser: (user: JwtPayload) => user.userType > USER_TYPE.USER,
};

export const UserType = (validator: UserTypeValidator | keyof UserTypeValidatorMap) => {
  if (typeof validator === 'string') {
    return SetMetadata(META_USER_TYPE, validators[validator]);
  }
  return SetMetadata(META_USER_TYPE, validator);
};
