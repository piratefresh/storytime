import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateFolderForm } from "./components/create-folder-form";
import { getStory } from "../../page";

async function CreateFolderPage({
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

  return <CreateFolderForm user={user} id={story?.id} />;
}

export default CreateFolderPage;
