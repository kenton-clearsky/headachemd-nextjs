'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ButtonWrapperProps {
  children: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  backgroundColor?: string;
}

const ButtonWrapper: React.FC<ButtonWrapperProps> = ({ 
  children = 'Button Text',
  variant = 'default',
  size = 'default',
  backgroundColor = '#ffffff'
}) => {
  return (
    <div style={{ backgroundColor: backgroundColor, padding: '10px' }}>
      <Button variant={variant} size={size}>
        {children}
      </Button>
    </div>
  );
};

export default ButtonWrapper;
