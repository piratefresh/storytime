import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { getStory } from "../../get-story";
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
  const story = await getStory({
    title: decodeURIComponent(title),
    userId: user.id,
  });

  if (!story) {
    redirect("/stories");
  }

  return <CreateFolderForm user={user} id={story.id} />;
}

export default CreateFolderPage;
