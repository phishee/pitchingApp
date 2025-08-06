import { Home, Calendar, PlayCircle, Target, TrendingUp, Heart, Trophy } from 'lucide-react';

export const athleteMenu = {
  menu_items: [
    { label: "Dashboard", icon: Home, route: "/dashboard" },
    { label: "My Schedule", icon: Calendar, route: "/schedule" },
    { label: "Workouts", icon: PlayCircle, route: "/workouts" },
    { label: "Assessments", icon: Target, route: "/assessments" },
    { label: "Progress", icon: TrendingUp, route: "/progress" },
    { label: "Wellness", icon: Heart, route: "/wellness" },
    { label: "Games", icon: Trophy, route: "/games" }
  ]
}; 