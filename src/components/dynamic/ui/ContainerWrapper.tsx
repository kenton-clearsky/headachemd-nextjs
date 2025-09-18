'use client';

import React from 'react';
import { Container } from '@mui/material';

interface ContainerWrapperProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

const ContainerWrapper: React.FC<ContainerWrapperProps> = ({ 
  children = 'Container Content',
  backgroundColor = '#ffffff',
  maxWidth = 'lg',
  disableGutters = false
}) => {
  return (
    <Container 
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{ 
        backgroundColor,
        border: '1px dashed #ccc',
        py: 2
      }}
    >
      {children}
    </Container>
  );
};

export default ContainerWrapper;
