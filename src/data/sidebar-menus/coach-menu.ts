import { Home, Users, Calendar, Dumbbell, Clipboard, BarChart, Trophy, CheckCircle } from 'lucide-react';

export const coachMenu = {
  menu_items: [
    { label: "Dashboard", icon: Home, route: "/dashboard" },
    { label: "My Athletes", icon: Users, route: "/athletes" },
    { label: "Schedule", icon: Calendar, route: "/schedule" },
    { label: "Workouts", icon: Dumbbell, route: "/workouts" },
    { label: "Assessments", icon: Clipboard, route: "/assessments" },
    { label: "Analytics", icon: BarChart, route: "/analytics" },
    { label: "Games", icon: Trophy, route: "/games" },
    { label: "Approvals", icon: CheckCircle, route: "/approvals", badge: "pending_count" }
  ]
};
