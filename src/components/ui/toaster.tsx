'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertColor,
  Box,
  Slide,
  SlideProps
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToasterContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToasterContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider');
  }
  return context;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9997, maxWidth: 400 }}>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 5000}
          onClose={() => dismiss(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
          sx={{ mb: 1 }}
        >
          <Alert
            onClose={() => dismiss(toast.id)}
            severity={getSeverityFromVariant(toast.variant)}
            sx={{ width: '100%' }}
          >
            {toast.title && (
              <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                {toast.title}
              </Box>
            )}
            {toast.description && (
              <Box>
                {toast.description}
              </Box>
            )}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}

function getSeverityFromVariant(variant?: string): AlertColor {
  switch (variant) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'destructive':
      return 'error';
    default:
      return 'info';
  }
}
