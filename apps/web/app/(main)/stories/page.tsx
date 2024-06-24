import Link from "next/link";
import { PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH1 } from "@/components/ui/typography";
import { db } from "@/lib/db";

export default async function StoriesPage(): Promise<React.ReactElement> {
  const stories = await db.story.findMany({});

  return (
    <div className="flex flex-col flex-1 px-8 gap-8">
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
          <Link href={`/stories/${story.title}`} key={story.id}>
            <Card className="w-[350px] border-border">
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>{story.description}</CardDescription>
              </CardHeader>

              <CardFooter className="flex justify-between">
                <Button>Edit</Button>
              </CardFooter>
            </Card>
          </Link>
        ))
      ) : (
        <div>No Stories</div>
      )}
    </div>
  );
}
