import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typography";
import db from "@/lib/db";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

export default async function StoriesPage() {
  const stories = await db.story.findMany({});

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center w-full">
        <TypographyH1>Stories</TypographyH1>
        <Link href="/stories/create">
          <Button className="flex flex-row items-center gap-4" variant="ghost">
            Create Story <PlusSquare />
          </Button>
        </Link>
      </div>
      {stories.length > 0 ? (
        stories.map((story) => (
          <Link href={`/stories/${story.title}`}>{story.title}</Link>
        ))
      ) : (
        <div>No nStories</div>
      )}
    </div>
  );
}
