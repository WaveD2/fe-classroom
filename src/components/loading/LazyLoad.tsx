import { memo, useState, useEffect } from 'react';
import DetailSkeleton from './LoadingSkeleton';

interface LazyLoadProps {
  children: React.ReactNode;
  delay?: number;
  fallback?: React.ReactNode;
}

const LazyLoad = memo(({ children, delay = 300, fallback }: LazyLoadProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Thêm delay nhỏ để animation mượt mà
      setTimeout(() => setShowContent(true), 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300">
        {fallback || <DetailSkeleton />}
      </div>
    );
  }

  return (
    <div 
      className={`transition-all duration-500 ${
        showContent 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
});

LazyLoad.displayName = 'LazyLoad';

export default LazyLoad;
