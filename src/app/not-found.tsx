import Link from 'next/link';

import { NotFoundActions } from '@/components/not-found/not-found-actions';

// Prevent static generation for 404 page
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 404 Number */}
          <div className="mb-6">
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              404
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Oops! Page Not Found
            </h1>
            <p className="text-gray-600 leading-relaxed">
              The page you're looking for seems to have vanished into thin air.
              Don't worry, even the best athletes miss sometimes!
            </p>
          </div>

          {/* Action Buttons */}
          <NotFoundActions />

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/app"
                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/app/users"
                className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
              >
                Users
              </Link>
              <Link
                href="/app/calendar"
                className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
              >
                Calendar
              </Link>
              <Link
                href="/app/workouts"
                className="px-3 py-1 text-xs bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors"
              >
                Workouts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


