
// export default function Page() {
//   //generate the long text to make it scroll
//   const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
//   return <div>
//     <div className="flex flex-col gap-4">
//       <h1 className="text-2xl font-bold">Dashboard</h1>
//       <p className="text-sm text-gray-500">
//         {/* {Array.from({ length: 100 }).map((_, index) => (
//           <span key={index}>{longText}</span>
//         ))} */}
//       </p>
//     </div>
//   </div>;
// }

'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-context';
import { AthleteDashboard } from '@/app/components/dashboard/athlete-dashboard';
import { CoachDashboard } from '@/app/components/dashboard/coach-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Render different dashboards based on user role
  switch (user.role) {
    case 'athlete':
      return <AthleteDashboard />;
    case 'coach':
      return <CoachDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}
