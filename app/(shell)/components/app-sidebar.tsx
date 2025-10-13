'use client';

import { cn } from '@/lib/utils';
import { usePlatformStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export function AppSidebar() {
  const { sidebarOpen, activeApp } = usePlatformStore();
  const pathname = usePathname();

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fa-solid fa-house' },
    { name: 'Admissions', href: '/admissions', icon: 'fa-solid fa-clipboard-check' },
    { name: 'SIS', href: '/sis', icon: 'fa-solid fa-graduation-cap' },
    { name: 'AI Teammates', href: '/ai-teammates', icon: 'fa-solid fa-robot' },
    { name: 'Admin', href: '/admin', icon: 'fa-solid fa-cog' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-30 bg-white text-gray-800 border-r border-gray-200 transition-all duration-300',
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
                'hover:bg-gray-100 text-gray-700',
                isActive && 'bg-blue-50 text-primary font-medium'
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
