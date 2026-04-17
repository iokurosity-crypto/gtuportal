/**
 * Performance utilities for optimizing app rendering and API calls
 */

/**
 * Debounce a function - delays execution until after the specified wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle a function - limits execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Request cache to avoid duplicate API calls
 */
class RequestCache {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 minutes TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

export const apiCache = new RequestCache();

/**
 * Create a batched API call function to combine multiple requests
 * @param {Function} apiFn - API function to batch
 * @param {number} batchDelay - Delay before executing batch in ms
 * @returns {Function} Batched function
 */
export const createBatchedRequest = (apiFn, batchDelay = 50) => {
  let batch = [];
  let timeout;

  const executeBatch = async () => {
    const currentBatch = [...batch];
    batch = [];

    try {
      const results = await Promise.all(
        currentBatch.map((item) => apiFn(item))
      );
      return results;
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  };

  return (item) => {
    batch.push(item);

    if (timeout) clearTimeout(timeout);

    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        executeBatch()
          .then((results) => {
            resolve(results);
          })
          .catch(reject);
      }, batchDelay);
    });
  };
};

/**
 * Image optimization helper - returns optimized image URL
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return '';

  const {
    width = 800,
    height = null,
    quality = 80,
    format = 'auto',
  } = options;

  // If it's an Unsplash URL
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams({
      auto: format,
      fit: 'crop',
      q: quality,
      w: width,
    });
    if (height) params.set('h', height);

    // Add params if not already present
    const hasParams = url.includes('?');
    return url + (hasParams ? '&' : '?') + params;
  }

  // If it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Cloudinary transformation
    const qualityParam = `q_${quality}`;
    const widthParam = `w_${width}`;
    const heightParam = height ? `h_${height}` : '';

    const transform = [qualityParam, widthParam, heightParam]
      .filter(Boolean)
      .join(',');

    return url.replace('/upload/', `/upload/${transform}/`);
  }

  return url;
};

/**
 * Preload images for faster loading
 * @param {Array<string>} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};

export default {
  debounce,
  throttle,
  apiCache,
  createBatchedRequest,
  optimizeImageUrl,
  preloadImages,
};
