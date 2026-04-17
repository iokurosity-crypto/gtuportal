import { useRef, useEffect, useState } from 'react';

/**
 * Lazy-loaded video component 
 * - Uses IntersectionObserver for efficient lazy loading
 * - Only loads video when visible in viewport
 * - Supports autoplay, muted, loop
 */
export const LazyVideo = ({
  src,
  className = '',
  poster = null,
  autoplay = false,
  muted = true,
  loop = true,
  controls = false,
  onCanPlay = null,
  onError = null,
  ...props
}) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '100px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const handleCanPlay = () => {
    setIsLoaded(true);
    onCanPlay?.();
  };

  const handleError = (e) => {
    console.error('Video failed to load:', e);
    onError?.(e);
  };

  return (
    <video
      ref={videoRef}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-75'
      }`}
      poster={poster}
      autoPlay={isVisible && autoplay}
      muted={muted}
      loop={loop}
      controls={controls}
      onCanPlay={handleCanPlay}
      onError={handleError}
      preload={isVisible ? 'auto' : 'none'}
      {...props}
    >
      {isVisible && <source src={src} type="video/mp4" />}
      Your browser does not support the video tag.
    </video>
  );
};

export default LazyVideo;
