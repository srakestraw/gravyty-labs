'use client';

import { cn } from '@/lib/utils';
import { usePlatformStore } from '@/lib/store';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const { sidebarOpen, activeApp } = usePlatformStore();
  const pathname = usePathname();

  // Simple navigation - just home for now
  // Apps will add their own navigation in next phase
  const navigation = [
    { name: 'Dashboard', href: activeApp.path, icon: 'fa-home' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-40 bg-sidebar text-sidebar-foreground transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <nav className="flex flex-col gap-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                'hover:bg-sidebar-accent',
                isActive && 'bg-sidebar-accent text-white'
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
