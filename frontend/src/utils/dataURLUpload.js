// Temporary fallback for image upload using data URLs
// This will work immediately without any external service configuration

export const uploadAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    console.log('Starting Data URL upload for:', file?.name, file?.type, file?.size);
    
    // Validate file
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error('Image size should be less than 10MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!isValidDataURLSize(e.target.result)) {
          reject(new Error('Image is too large to be stored'));
          return;
        }
        const result = {
          url: e.target.result,
          publicId: `dataurl_${Date.now()}`,
          width: null, // Will be determined by browser
          height: null,
          isDataURL: true,
          fileName: file.name,
          fileSize: file.size
        };
        console.log('Data URL upload successful:', result);
        resolve(result);
      } catch (error) {
        console.error('Error processing Data URL:', error);
        reject(new Error('Failed to process image'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file as Data URL:', error);
      reject(new Error('Failed to read file'));
    }
  });
};

// Check if data URL is too large for storage
export const isValidDataURLSize = (dataURL) => {
  // Data URLs are roughly 33% larger than the original file
  const estimatedSize = (dataURL.length * 3) / 4;
  return estimatedSize < 5 * 1024 * 1024; // 5MB limit for data URLs
};
