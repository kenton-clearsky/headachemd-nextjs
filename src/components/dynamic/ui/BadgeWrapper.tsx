'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BadgeWrapperProps {
  children: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  backgroundColor?: string;
}

const BadgeWrapper: React.FC<BadgeWrapperProps> = ({ 
  children = 'Badge Text',
  variant = 'default',
  backgroundColor = '#ffffff'
}) => {
  return (
    <div style={{ backgroundColor: backgroundColor, padding: '10px' }}>
      <Badge variant={variant}>
        {children}
      </Badge>
    </div>
  );
};

export default BadgeWrapper;
