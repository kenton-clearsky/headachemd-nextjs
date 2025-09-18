'use client';

import React from 'react';
import { Toaster } from '@/components/ui/toaster';

interface ToasterWrapperProps {
  backgroundColor?: string;
}

const ToasterWrapper: React.FC<ToasterWrapperProps> = ({ 
  backgroundColor = '#ffffff'
}) => {
  return (
    <div style={{ backgroundColor: backgroundColor, padding: '20px' }}>
      <Toaster />
    </div>
  );
};

export default ToasterWrapper;
