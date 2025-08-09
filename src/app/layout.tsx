import { ThemeProvider } from '@/providers/theme-provider';
// import './globals.css';
import '@/css/styles.css';
import { cn } from '@/lib/utils'; // Utility for className merging (optional)
import { OrganizationProvider } from '@/providers/organization-context';
import { AuthProvider } from '@/providers/auth-context';
import { OnboardingProvider } from '@/providers/onboarding-context';
import { UserProvider } from '@/providers/user.context';
import { TeamProvider } from '@/providers/team-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={cn(
          'antialiased flex h-full text-base text-foreground bg-gray-100'
        )}

      >
        <AuthProvider>
          <UserProvider>
            <OrganizationProvider>
              <TeamProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
              </TeamProvider>
            </OrganizationProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}