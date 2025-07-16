import { ThemeProvider } from '@/providers/theme-provider';
// import './globals.css';
import '@/css/styles.css';
import { cn } from '@/lib/utils'; // Utility for className merging (optional)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={cn(
          'antialiased flex h-full text-base text-foreground bg-background'
        )}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}