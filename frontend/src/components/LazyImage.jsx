import { useState, useEffect, useRef } from 'react';

/**
 * Lazy-loaded image component with progressive loading
 * - Uses IntersectionObserver for efficient lazy loading
 * - Shows placeholder while loading
 * - Supports blur-up effect
 */
export const LazyImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  placeholderSrc = null,
  onLoad = null,
  onError = null,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(placeholderSrc || src);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          // Start loading the actual image
          const img = new Image();
          
          img.onload = () => {
            setDisplaySrc(src);
            setIsLoaded(true);
            setHasError(false);
            onLoad?.();
          };
          
          img.onerror = () => {
            setHasError(true);
            onError?.();
          };
          
          img.src = src;
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' } // Start loading 50px before entering viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={displaySrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-75'
      } ${hasError ? 'bg-gray-200' : ''}`}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
