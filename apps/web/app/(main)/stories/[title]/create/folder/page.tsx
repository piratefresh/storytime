import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { getStory } from '../../../actions/get-story';
import { CreateFolderForm } from './components/create-folder-form';

async function CreateFolderPage({
  params: { title },
}: {
  params: { title: string };
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect('/stories');
  }
  const story = await getStory({
    title: decodeURIComponent(title),
    userId: user.id,
  });

  if (!story) {
    redirect('/stories');
  }

  return <CreateFolderForm user={user} id={story?.id} />;
}

export default CreateFolderPage;
