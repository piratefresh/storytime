import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import { validateProtected } from "@/lib/validateProtected";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cache } from "react";

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

async function FolderPage({
  params: { title, name },
}: {
  params: { title: string; name: string };
}) {
  const { user } = await validateProtected({ redirectURL: "/stories" });

  const story = await getStory({
    title: decodeURIComponent(title),
    id: user.id,
  });

  if (!story) {
    redirect("/stories");
  }

  return (
    <div className="flex">
      <h2>
        {name} of {story?.title}
      </h2>
      <Link href={`/stories/${story?.title}/create/assets`}>
        <Button className="self-start">Add an Asset</Button>
      </Link>
    </div>
  );
}

export default FolderPage;
