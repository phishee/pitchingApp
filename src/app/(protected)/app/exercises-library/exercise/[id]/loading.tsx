export default function ExerciseDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="w-14 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-lg">
                          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="w-64 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
                        <div>
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="w-48 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div>
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
