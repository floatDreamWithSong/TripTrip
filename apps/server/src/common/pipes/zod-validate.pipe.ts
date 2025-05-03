import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { emailSchema, pageQuerySchema, passageReviewSchema, passageTagsSchema, passageTextSchema, userLoginSchema, userRegisterSchema } from '@triptrip/utils';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodSchema<T>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      console.log(result.error.message);
      throw new BadRequestException('Zod Validation failed');
    }
    return result.data;
  }
  static emailSchema = new ZodValidationPipe(emailSchema);
  static passageReviewSchema = new ZodValidationPipe(passageReviewSchema);
  static pageQuerySchema = new ZodValidationPipe(pageQuerySchema);
  static passageTagsSchema = new ZodValidationPipe(passageTagsSchema);
  static passageTextSchema = new ZodValidationPipe(passageTextSchema);
  static userRegisterSchema = new ZodValidationPipe(userRegisterSchema);
  static userLoginSchema = new ZodValidationPipe(userLoginSchema)

}
