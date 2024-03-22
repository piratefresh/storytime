import { CreateStoryForm } from "@/app/(main)/stories/create/components/create-story-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function CreateStoryPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/");
  }

  return <CreateStoryForm user={user} />;
}

export default CreateStoryPage;
