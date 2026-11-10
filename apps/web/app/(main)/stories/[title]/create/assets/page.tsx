import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { getStory } from "@/lib/stories";
import { CreateAssetForm } from "./components/create-asset-form";

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
  const story = await getStory(user.id, decodeURIComponent(title));

  if (!story) {
    redirect("/stories");
  }

  return <CreateAssetForm user={user} id={story.id} folders={story.folder} />;
}

export default CreateAssetPage;
