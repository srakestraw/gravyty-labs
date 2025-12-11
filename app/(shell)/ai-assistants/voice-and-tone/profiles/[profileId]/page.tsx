import { ProfileEditorClient } from './ProfileEditorClient';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
// Return placeholder to satisfy static export requirement
// Actual routes will be handled client-side
export async function generateStaticParams() {
  return [{ profileId: 'placeholder' }];
}

interface PageProps {
  params: {
    profileId: string;
  };
}

export default function ProfilePage({ params }: PageProps) {
  return <ProfileEditorClient profileId={params.profileId} />;
}
