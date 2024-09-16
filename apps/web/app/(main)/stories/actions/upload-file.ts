'use server';

import crypto from 'crypto';
import { validateRequest } from '@/lib/auth';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ZodError } from 'zod';

type SignedURLResponse = Promise<
  | { error?: undefined; success: { url: string; id: number } }
  | { error: string; success?: undefined }
>;

type UploadResult = {
  url: string | null;
  bucket: string;
  key: string;
  name?: string;
  size?: number;
};

type GetSignedURLParams = {
  file: File;
};

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const maxFileSize = 1048576 * 10; // 1 MB

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

export async function uploadFile(file: File): Promise<string> {
  console.log('file: ', file);

  const { user } = await validateRequest();
  if (!user) {
    console.log('no user found');
    throw new ZodError([
      {
        path: ['auth'],
        code: 'custom',
        message: 'User not found',
      },
    ]);
  }

  const fileName = generateFileName();
  console.log('fileName: ', fileName);

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: file,
  });

  const url = await getSignedUrl(
    s3Client,
    putObjectCommand,
    { expiresIn: 60 }, // 60 seconds
  );

  console.log('url: ', url);

  return url;
}
