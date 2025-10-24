// src/app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider';
import '@/css/styles.css';
import { cn } from '@/lib/utils';
import { OrganizationProvider } from '@/providers/organization-context';
import { AuthProvider } from '@/providers/auth-context';
import { UserProvider } from '@/providers/user.context';
import { TeamProvider } from '@/providers/team-context';
import { AuthRedirectHandler } from '@/providers/auth-redirect-handler-context';
import { LayoutProvider } from '@/providers/layout-context';
import { HeaderProvider } from '@/providers/header-context'

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
                  <LayoutProvider>
                    <HeaderProvider> {/* Add this wrapper */}
                      <AuthRedirectHandler>
                        {children}
                      </AuthRedirectHandler>
                    </HeaderProvider>
                  </LayoutProvider>
                </ThemeProvider>
              </TeamProvider>
            </OrganizationProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}