import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getStory } from "@/lib/stories";
import { validateProtected } from "@/lib/validate-protected";

async function FolderPage({
  params,
}: {
  params: Promise<{ title: string; name: string }>;
}) {
  const { title, name } = await params;
  const { user } = await validateProtected({ redirectURL: "/stories" });

  const story = await getStory(user.id, decodeURIComponent(title));

  if (!story) {
    redirect("/stories");
  }

  return (
    <div className="flex">
      <h2>
        {decodeURIComponent(name)} of {story.title}
      </h2>
      <Link href={`/stories/${story.title}/create/assets`}>
        <Button className="self-start">Add an Asset</Button>
      </Link>
    </div>
  );
}

export default FolderPage;
