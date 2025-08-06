'use client';
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "../common/sidebar";
import '@/css/styles.css';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    return (
        <div>
            <div className="flex grow">
                <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
                    {!isMobile && <Sidebar />}
                    <main className="ml-[var(--sidebar-width)]">{children}</main>
                </div>
            </div>

        </div>
    );
}