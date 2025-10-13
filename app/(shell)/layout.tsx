import { AppHeader } from './components/app-header';
import { AppSidebar } from './components/app-sidebar';

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AppSidebar />
      <main className="pl-16 pt-14">
        {children}
      </main>
    </div>
  );
}
