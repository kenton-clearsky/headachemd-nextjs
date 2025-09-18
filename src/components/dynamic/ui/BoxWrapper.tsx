'use client';

import React from 'react';
import { Box } from '@mui/material';

interface BoxWrapperProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  padding?: number;
  margin?: number;
  width?: string;
  height?: string;
}

const BoxWrapper: React.FC<BoxWrapperProps> = ({ 
  children = 'Box Content', 
  backgroundColor = '#ffffff',
  padding = 2,
  margin = 2,
  width = '100%',
  height = 'auto'
}) => {
  return (
    <Box 
      sx={{ 
        backgroundColor, 
        padding, 
        margin,
        width,
        height,
        border: '1px dashed #ccc'
      }}
    >
      {children}
    </Box>
  );
};

export default BoxWrapper;
