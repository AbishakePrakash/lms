import { S3Client, PutObjectCommand, InvalidRequest } from '@aws-sdk/client-s3';
import { InternalServerErrorException } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESSKEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_BUCKET;
// const path = "lmsdev/community/"
// const path = "lmsdev/community/"

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new InternalServerErrorException('S3 Bucket Initialization failed');
}

const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});
export const uploadToS3 = async (
  buffer: Buffer,
  filename: string,
  mimetype: string,
) => {
  //   console.log('aws1');

  //   const bucketName = 'haloquant';
  const uniqueFilename = `test/${Date.now()}_${filename}`;

  const params = {
    Bucket: bucketName,
    Key: uniqueFilename,
    Body: buffer,
    ContentType: mimetype,
  };

  try {
    // console.log('aws2');

    const awsReturn = await s3.send(new PutObjectCommand(params));
    console.log({ awsReturn });

    const url = `https://${bucketName}.s3.amazonaws.com/${uniqueFilename}`;
    // console.log('aws3');

    return url;
  } catch (error) {
    // console.log('aws1`');

    console.error('Error uploading to S3:', error);
    throw error;
  }
};
