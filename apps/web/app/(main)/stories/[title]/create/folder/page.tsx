import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { getStory } from "@/lib/stories";
import { CreateFolderForm } from "./components/create-folder-form";

async function CreateFolderPage({
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

  return <CreateFolderForm user={user} id={story.id} />;
}

export default CreateFolderPage;
