import Link from 'next/link';
import { ArrowLeft, Search, Plus } from 'lucide-react';

export default function ExerciseNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Exercise Not Found</h1>
        <p className="text-gray-600 mb-8">
          The exercise you're looking for doesn't exist or may have been removed.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/exercises-library"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exercises Library
          </Link>
          
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Exercise
          </button>
        </div>
      </div>
    </div>
  );
}

