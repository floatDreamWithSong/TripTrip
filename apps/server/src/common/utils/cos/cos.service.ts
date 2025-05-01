import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import COS from 'cos-nodejs-sdk-v5';
import { Configurations } from 'src/common/config';

@Injectable()
export class CosService implements OnModuleInit {
  private cos: COS;
  private readonly logger = new Logger(CosService.name);
  private baseParam: COS.PutObjectAclParams;
  onModuleInit() {
    this.cos = new COS({
      SecretId: Configurations.COS_SECRET_ID,
      SecretKey: Configurations.COS_SECRET_KEY,
    });
    this.baseParam = {
      Bucket: Configurations.COS_BUCKET,
      Region: Configurations.COS_REGION,
      Key: '', // 文件在桶中的存储path，以及存储名称
    };
    this.logger.log(this.baseParam);
  }
  async uploadFile(file: Express.Multer.File) {
    const { originalname, buffer } = file;
    const randomName = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${originalname}`;
    // 根据mimetype分发到不同的文件夹
    // let folder = '';
    // switch (file.mimetype) {
    //     case 'image/jpeg':
    //     case 'image/png':
    //     case 'image/gif':
    //     case 'image/webp':
    //         folder = 'images';
    //         break;
    //     case 'video/mp4':
    //     case 'video/quicktime':
    //         folder = 'videos';
    //         break;
    //     default:
    //         folder = 'others';
    //         break;
    // }
    // 上传文件到COS
    // const Key = path.join(folder, randomName);
    const Key = randomName;
    const params = {
      ...this.baseParam,
      Key,
      Body: buffer,
    };
    this.logger.log(params);
    const res = await this.cos.putObject(params);
    return res.Location;
  }
  async deleteFile(Key: string) {
    const params = {
      ...this.baseParam,
      Key,
    };
    const res = await this.cos.deleteObject(params);
    return res;
  }
}
