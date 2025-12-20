'use client';

import React from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';
import type { Toast } from './useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/**
 * Simple toast container component.
 * Displays toasts in the top-right corner.
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md',
            'bg-white text-gray-900',
            toast.type === 'success' && 'border-green-200 bg-green-50',
            toast.type === 'error' && 'border-red-200 bg-red-50',
            toast.type === 'info' && 'border-blue-200 bg-blue-50'
          )}
        >
          {toast.type === 'success' && (
            <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-5 w-5 text-green-600" />
          )}
          {toast.type === 'error' && (
            <FontAwesomeIcon icon="fa-solid fa-circle-xmark" className="h-5 w-5 text-red-600" />
          )}
          {toast.type === 'info' && (
            <FontAwesomeIcon icon="fa-solid fa-circle-info" className="h-5 w-5 text-blue-600" />
          )}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

