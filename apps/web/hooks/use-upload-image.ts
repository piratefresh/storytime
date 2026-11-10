import crypto from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createMedia } from "@/app/(main)/assets/media/actions/create-media";

interface UploadResult {
  url: string | null;
  bucket: string;
  key: string;
  name?: string;
  size?: number;
}

const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? "";
const bucketRegion = process.env.NEXT_PUBLIC_AWS_BUCKET_REGION ?? "";

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY ?? "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export async function useUploadImage({
  file,
  contentId,
  storyId,
  userId,
}: {
  file: File;
  contentId: string;
  storyId: string;
  userId: string;
}): Promise<UploadResult | null> {
  const fileName = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
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
    const { user } = (await userResponse.json()) as { user?: unknown };
    console.log("user: ", user);
    if (!user) {
      return null;
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
      const publicUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;
      const createMediaResponse = await createMedia({
        fileId: contentId,
        url: publicUrl,
        storyId,
        userId,
      });
      console.log("createMediaResponse: ", createMediaResponse);
      if (!createMediaResponse || "error" in createMediaResponse) {
        console.error("Couldn't connect image to media library");
        return null;
      }
      return {
        url: publicUrl,
        bucket: bucketName,
        key: fileName,
        name: file.name,
        size: file.size,
      };
    } 
      console.error("Upload failed:", response.statusText);
      return null;
    
  } catch (error) {
    console.error("Error generating signed URL:", error);

    return null;
  }
}
