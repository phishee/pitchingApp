"use client";
import { Sidebar } from "@/app/components/layouts/common/sidebar";
import { useAuth } from "@/providers/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!user) {
      router.push('/sign-in');
    }
  }, [user]);

  if(!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <main className="grow ml-64 p-4 bg-white rounded-3xl m-4 overflow-y-auto shadow-md">
        {children}
      </main>
    </div>
  );
}