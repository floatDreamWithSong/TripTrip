import { EXCEPTIONS } from 'src/common/exceptions';

export class UploadFilter {
  static readonly imageSizeLimit = 2 * 1024 * 1024; // 2MB
  static readonly videoSizeLimit = 50 * 1024 * 1024; // 50MB
  static readonly allowedImageTypes = /image\/(jpeg|png|gif|webp)$/;
  static readonly allowedVideoTypes = /video\/(mp4|webm|ogg|avi)$/;

  static fileFilter(fieldname: string, file: any, callback: (error: Error | null, acceptFile: boolean) => void) {
    if (fieldname === 'images') {
      if (!file.mimetype.match(UploadFilter.allowedImageTypes)) {
        return callback(EXCEPTIONS.INVALID_IMAGE_TYPE, false);
      }
    } else if (fieldname === 'video') {
      if (!file.mimetype.match(UploadFilter.allowedVideoTypes)) {
        return callback(EXCEPTIONS.INVALID_VIDEO_TYPE, false);
      }
    }
    callback(null, true);
  }

  static validateFileSize(files: { images?: Express.Multer.File[], video?: Express.Multer.File[], cover: Express.Multer.File[] }) {
    files.images?.forEach((image) => {
      if (image.size > UploadFilter.imageSizeLimit) {
        throw EXCEPTIONS.IMAGE_SIZE_EXCEEDED;
      }
    });
    if(files.cover === undefined){
      throw EXCEPTIONS.COVER_IMAGE_NOT_FOUND;
    }
    files.cover.forEach((image) => {
      if (image.size > UploadFilter.imageSizeLimit) {
        throw EXCEPTIONS.IMAGE_SIZE_EXCEEDED;
      }
    });
    files.video?.forEach((video) => {
      if (video.size > UploadFilter.videoSizeLimit) {
        throw EXCEPTIONS.VIDEO_SIZE_EXCEEDED;
      }
    })
  }
}