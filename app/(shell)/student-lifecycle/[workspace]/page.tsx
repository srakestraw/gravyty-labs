import { redirect } from 'next/navigation';
import { WORKSPACES } from '../lib/workspaces';

export const dynamic = 'force-static';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return WORKSPACES.map((w) => ({
    workspace: w.id,
  }));
}

export default function WorkspaceIndex({ params }: { params: { workspace: string } }) {
  redirect(`/student-lifecycle/${params.workspace}/ai`);
}



