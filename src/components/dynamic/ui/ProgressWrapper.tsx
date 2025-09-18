'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressWrapperProps {
  value?: number;
  backgroundColor?: string;
}

const ProgressWrapper: React.FC<ProgressWrapperProps> = ({ 
  value = 50,
  backgroundColor = '#ffffff'
}) => {
  return (
    <div style={{ backgroundColor: backgroundColor, padding: '20px' }}>
      <Progress value={value} />
    </div>
  );
};

export default ProgressWrapper;
