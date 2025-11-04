'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { usePlatformStore } from '@/lib/store';
import { AppSwitcher } from './app-switcher';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { activeApp, toggleSidebar } = usePlatformStore();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-2 sm:px-4 gap-2 sm:gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <FontAwesomeIcon icon="fa-solid fa-bars" className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <AppSwitcher />

          <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
            <div 
              className="h-5 w-5 sm:h-6 sm:w-6 rounded flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: activeApp.color }}
            >
              {activeApp.shortName.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-xs sm:text-sm hidden sm:inline">
              {activeApp.shortName}
            </span>
          </div>
        </div>

        {/* Center Section - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-auto">
          <div className="relative w-full">
            <FontAwesomeIcon icon="fa-solid fa-search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-4 rounded-md border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-0 sm:gap-1 ml-auto">
          {/* Mobile search button */}
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
            <FontAwesomeIcon icon="fa-solid fa-search" className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
            <FontAwesomeIcon icon="fa-solid fa-bell" className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:flex">
            <FontAwesomeIcon icon="fa-solid fa-circle-question" className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:flex">
            <FontAwesomeIcon icon="fa-solid fa-gear" className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1 sm:ml-2">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                  <AvatarFallback className="text-xs">
                    {user?.displayName ? getInitials(user.displayName) : 'GL'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
