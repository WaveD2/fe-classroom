import { memo } from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton = memo(({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
));

Skeleton.displayName = 'Skeleton';

// Skeleton cho danh sách cards
export const ListSkeleton = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Card Header */}
        <div className="bg-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
));

ListSkeleton.displayName = 'ListSkeleton';

// Skeleton cho stats cards
export const StatsSkeleton = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

StatsSkeleton.displayName = 'StatsSkeleton';

// Skeleton cho detail page
export const DetailSkeleton = memo(() => (
  <div className="space-y-8">
    {/* Profile Skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 py-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

DetailSkeleton.displayName = 'DetailSkeleton';

export default Skeleton;
