import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateAssetForm } from "./components/create-asset-form";
import { cache } from "react";
import db from "@/lib/db";

export const getStory = cache(
  async ({ id, title }: { id: string; title: string }) => {
    const item = await db.story.findFirst({
      where: {
        ownerId: id,
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
  params: { title },
}: {
  params: { title: string };
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/stories");
  }
  const story = await getStory({
    title: decodeURIComponent(title),
    id: user.id,
  });

  if (!story) {
    redirect("/stories");
  }

  return <CreateAssetForm user={user} id={story?.id} folders={story.folder} />;
}

export default CreateAssetPage;
