import EvalDetailClient from './EvalDetailClient';

interface EvalPageProps {
  params: { id: string };
}

// Required for static export with dynamic routes
export function generateStaticParams() {
  return [{ id: 'eval-1' }];
}

export default function EvalPage({ params }: EvalPageProps) {
  return <EvalDetailClient />;
}
