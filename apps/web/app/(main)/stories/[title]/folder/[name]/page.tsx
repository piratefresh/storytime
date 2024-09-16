import { Button } from '@/components/ui/button';
import { validateProtected } from '@/lib/validate-protected';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getStory } from '../../../actions/get-story';

async function FolderPage({
  params: { title, name },
}: {
  params: { title: string; name: string };
}) {
  const { user } = await validateProtected({ redirectURL: '/stories' });

  const story = await getStory({
    title: decodeURIComponent(title),
    userId: user.id,
  });

  if (!story) {
    redirect('/stories');
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
