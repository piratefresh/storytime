import { createMedia } from "@/app/(main)/assets/media/actions/create-media";
import db from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

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
  region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const maxFileSize = 1048576 * 10; // 1 MB

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export async function useUploadImage({
  file,
  contentId,
}: {
  file: File;
  contentId: string;
}): Promise<UploadResult> {
  const fileName = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    Metadata: {
      contentId,
    },
  });

  try {
    const url = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600,
    });

    const userResponse = await fetch("/session/get-user");
    const { user } = await userResponse.json();
    console.log("user: ", user);
    if (!user) {
      return {
        error: "User not found",
      };
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (response.ok) {
      // Construct the public URL of the uploaded file
      const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!}.s3.${process.env.NEXT_PUBLIC_AWS_BUCKET_REGION!}.amazonaws.com/${fileName}`;
      const createMediaResponse = await createMedia({
        url: publicUrl,
        contentId,
      });
      console.log("createMediaResponse: ", createMediaResponse);
      if (createMediaResponse?.error) {
        return { error: "Couldn't connect image to media library" };
      }
      if (createMediaResponse?.success) {
        return publicUrl;
      }
    } else {
      console.error("Upload failed:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error generating signed URL:", error);

    return false;
  }
}
