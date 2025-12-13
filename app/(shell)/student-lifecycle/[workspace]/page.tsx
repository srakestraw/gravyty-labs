import { redirect } from 'next/navigation';

export default function WorkspaceIndex({ params }: { params: { workspace: string } }) {
  redirect(`/student-lifecycle/${params.workspace}/ai`);
}



