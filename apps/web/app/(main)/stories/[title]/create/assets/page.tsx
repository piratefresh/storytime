import { redirect } from "next/navigation";
import { cache } from "react";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { CreateAssetForm } from "./components/create-asset-form";

const getStory = cache(
  async ({ title, userId }: { title: string; userId: string }) => {
    const item = await db.story.findFirst({
      where: {
        ownerId: userId,
        title,
      },
      include: {
        folder: true,
      },
    });
    return item;
  }
);

async function CreateAssetPage({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = await params;
  const { user } = await validateRequest();

  if (!user) {
    redirect("/stories");
  }
  const story = await getStory({
    title: decodeURIComponent(title),
    userId: user.id,
  });

  if (!story) {
    redirect("/stories");
  }

  return <CreateAssetForm user={user} id={story.id} folders={story.folder} />;
}

export default CreateAssetPage;
