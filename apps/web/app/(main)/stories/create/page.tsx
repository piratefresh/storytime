import { redirect } from "next/navigation";
import { CreateStoryForm } from "@/app/(main)/stories/create/components/create-story-form";
import { validateRequest } from "@/lib/auth";

export async function CreateStoryPage(): Promise<JSX.Element> {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/");
  }

  return <CreateStoryForm />;
}

export default CreateStoryPage;
