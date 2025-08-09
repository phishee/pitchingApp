import { ReactNode } from 'react';
import Link from 'next/link';
// import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Moon, Settings, User, CreditCard } from 'lucide-react';
import { useUser } from '@/providers/user.context';
import { useAuth } from '@/providers/auth-context';

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
//   const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { user } = useUser();
  const router = useRouter();
 

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center gap-2 p-3">
          <img
            className="w-9 h-9 rounded-full border border-border"
            src={user?.profileImageUrl}
            alt="User avatar"
          />
          <div className="flex flex-col">
            <span className="text-sm text-mono font-semibold">
              {/* {session?.user.name || ''} */}
              {user?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {/* {session?.user.email || ''} */}
              {user?.email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link
            href="/account/home/user-profile"
            className="flex items-center gap-2"
          >
            <User />
            My Profile
          </Link>
        </DropdownMenuItem>

        {/* Settings Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Settings />
            Settings
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href="/account/home/user-profile"
                className="flex items-center gap-2"
              >
                <User />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/billing/basic"
                className="flex items-center gap-2"
              >
                <CreditCard />
                Billing
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            // onClick={() => signOut()}
            onClick={async () => {
              await logout();
              router.push('/sign-in');
            }}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}