"use client";
import { Sidebar } from "@/app/components/layouts/common/sidebar";
import { useUser } from "@/providers/user.context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NO_TEAM_CONFIG } from '@/config/no-team.config';
import NoTeamWrapper from "@/components/common/no-team/no-team-wrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser(); // Add isLoading
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and no user
    if (!isLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoading, router]); // Add isLoading dependency

  // Show loading while checking auth state
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

  // Show redirecting state if no user (before redirect happens)
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
    <div className="flex h-screen w-full">
      <Sidebar />
      <main className="grow ml-64 p-4 bg-white rounded-3xl m-4 overflow-y-auto shadow-md">
        <NoTeamWrapper 
          excludePages={NO_TEAM_CONFIG.EXCLUDED_PAGES}
          excludePatterns={NO_TEAM_CONFIG.EXCLUDED_PATTERNS}
          showForAdmins={NO_TEAM_CONFIG.SHOW_FOR_ADMINS}
        >
          {children}
        </NoTeamWrapper>
      </main>
    </div>
  );
}