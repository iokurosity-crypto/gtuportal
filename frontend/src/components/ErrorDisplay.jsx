import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Global error display that shows errors persistently
let globalErrors = [];
let listeners = [];

export const showError = (error) => {
  const id = Date.now();
  const errorObj = {
    id,
    message: error?.message || String(error),
    timestamp: new Date().toLocaleTimeString(),
    stack: error?.stack || ''
  };
  globalErrors.unshift(errorObj);
  console.error('🔴 ERROR LOGGED:', errorObj);
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach(fn => fn([...globalErrors]));
};

export const clearErrors = () => {
  globalErrors = [];
  notifyListeners();
};

export const ErrorDisplay = () => {
  const [errors, setErrors] = useState(globalErrors);

  useEffect(() => {
    listeners.push(setErrors);
    return () => {
      listeners = listeners.filter(fn => fn !== setErrors);
    };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 max-w-md z-50 space-y-2">
      {errors.slice(0, 5).map(error => (
        <div
          key={error.id}
          className="bg-red-50 border-2 border-red-500 rounded-lg p-3 shadow-lg animate-pulse"
        >
          <div className="text-sm font-bold text-red-700">🔴 ERROR</div>
          <div className="text-xs text-red-600 font-mono break-words">{error.message}</div>
          <div className="text-xs text-gray-500 mt-1">{error.timestamp}</div>
          {error.stack && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-red-600">Stack trace</summary>
              <pre className="bg-red-100 p-2 mt-1 overflow-auto text-xs">{error.stack}</pre>
            </details>
          )}
          <button
            onClick={() => {
              globalErrors = globalErrors.filter(e => e.id !== error.id);
              notifyListeners();
            }}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Hook to use error display
export const useErrorDisplay = () => ({ showError, clearErrors });
