import { Shield, Users, Database, FileText, PieChart, Settings } from 'lucide-react';

export const adminMenu = {
  menu_items: [
    { label: "Dashboard", icon: Shield, route: "/admin/dashboard" },
    { label: "Users", icon: Users, route: "/admin/users" },
    { label: "Teams", icon: Users, route: "/admin/teams" },
    { label: "Exercises", icon: Database, route: "/admin/exercises" },
    { label: "Templates", icon: FileText, route: "/admin/templates" },
    { label: "Analytics", icon: PieChart, route: "/admin/analytics" },
    { label: "Settings", icon: Settings, route: "/admin/settings" }
  ]
}; 