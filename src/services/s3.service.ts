import { S3 } from 'aws-sdk';
import { FileUpload } from 'graphql-upload';
import pluralize = require('pluralize');
import { Service } from 'typedi';

@Service()
export class S3Service {
  // AWS S3 Object
  public client: S3 = new S3({
    region: process.env.AWS_REGION,
    signatureVersion: 'v4',
  });

  public async uploadFile(
    file: FileUpload,
    entityType: string,
    options: {
      ACL?: string;
    } = {},
  ): Promise<any> {
    const uploadParams = {
      Body: file.createReadStream(),
      Bucket: `${process.env.IMAGE_BUCKET_NAME}/${pluralize(entityType)}`,
      Key: file.filename,
      ContentType: file.mimetype,
      ACL: options.ACL || 'private',
    };

    return await this.client.upload(uploadParams).promise();
  }

  public async getSignedDownloadUrl(fileName, bucketName) {
    const params: any = {
      Key: fileName,
      Bucket: bucketName,
      ResponseContentDisposition: `attachment; filename=${fileName}`,
      Expires: 6000,
    };

    return await this.client.getSignedUrl('getObject', params);
  }

  public async getSignedUploadUrl(fileName, bucketName) {
    const params = {
      Key: fileName,
      Bucket: bucketName,
    };
    return await this.client.getSignedUrl('putObject', params);
  }
}

class UploadOptions {
  public ACL?: string;
}
