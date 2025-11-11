'use client';

import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotFoundActions() {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <button
        onClick={() => router.back()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>

      <Link
        href="/app"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
      >
        <Home className="w-4 h-4" />
        Return Home
      </Link>

      <button
        onClick={() => window.location.reload()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors font-medium"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}


