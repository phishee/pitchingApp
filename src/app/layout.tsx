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
import { HeaderProvider } from '@/providers/header-context';
import { PWAProvider } from '@/providers/pwa-context';
import Script from 'next/script';
import { LandscapeWarning } from '@/components/common/landscape-warning';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <meta name="application-name" content="Pitching App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pitching App" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/images/logo-1.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/logo-1.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/logo-1.png" />
      </head>
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
                    <HeaderProvider>
                      <PWAProvider>
                        <AuthRedirectHandler>
                          {children}
                        </AuthRedirectHandler>
                        {/* <LandscapeWarning /> */}
                      </PWAProvider>
                    </HeaderProvider>
                  </LayoutProvider>
                </ThemeProvider>
              </TeamProvider>
            </OrganizationProvider>
          </UserProvider>
        </AuthProvider>
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}