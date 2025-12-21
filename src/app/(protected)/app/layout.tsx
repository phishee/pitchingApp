// src/app/(protected)/app/layout.tsx
"use client";
import { Sidebar } from "@/app/components/layouts/common/sidebar";
import { MobileHeader } from "@/components/layouts/mobile-header";
import { BottomNavigation } from "@/components/layouts/bottom-navigation";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useUser } from "@/providers/user.context";
import { useLayout } from "@/providers/layout-context";
import { useHeader } from "@/providers/header-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NO_TEAM_CONFIG } from '@/config/no-team.config';
import NoTeamWrapper from "@/components/common/no-team/no-team-wrapper";

import { PendingQuestionnaireManager } from "@/components/questionnaires/flow/PendingQuestionnaireManager";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const { isMobile, sidebarOpen } = useLayout();
  const { setVariant, setTitle } = useHeader();
  const router = useRouter();

  // Set the no-background header for all pages in this layout
  useEffect(() => {
    setVariant('no-background');
    setTitle('My Plan');
  }, [setVariant, setTitle]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <PendingQuestionnaireManager />
      {/* Mobile Header - Fixed at top */}
      <MobileHeader />

      {/* Main Layout Container */}
      <div className="flex h-full w-full">
        {/* Desktop Sidebar */}
        {!isMobile && sidebarOpen && <Sidebar />}

        {/* Main Content */}
        <main className={`grow ${isMobile ? 'pt-20 pb-16' : 'ml-64 p-4 bg-white rounded-3xl m-4 overflow-y-auto shadow-md'}`}>
          <NoTeamWrapper
            excludePages={NO_TEAM_CONFIG.EXCLUDED_PAGES}
            excludePatterns={NO_TEAM_CONFIG.EXCLUDED_PATTERNS}
            showForAdmins={NO_TEAM_CONFIG.SHOW_FOR_ADMINS}
          >
            {children}
          </NoTeamWrapper>
        </main>
      </div>

      {/* Bottom Navigation for Mobile - Fixed at bottom */}
      <BottomNavigation />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}