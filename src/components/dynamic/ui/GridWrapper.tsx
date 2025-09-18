'use client';

import React from 'react';
import { Grid, Box, Typography } from '@mui/material';

interface GridWrapperProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  container?: boolean;
  spacing?: number;
  columns?: number;
}

const GridWrapper: React.FC<GridWrapperProps> = ({ 
  children,
  backgroundColor = '#ffffff',
  container = true,
  spacing = 2,
  columns = 12
}) => {
  // If no children are provided, show a placeholder with example grid items
  const gridContent = children || (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ p: 2, border: '1px dashed #ccc', bgcolor: '#f5f5f5' }}>
          <Typography>Grid Item 1</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ p: 2, border: '1px dashed #ccc', bgcolor: '#f5f5f5' }}>
          <Typography>Grid Item 2</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ p: 2, border: '1px dashed #ccc', bgcolor: '#f5f5f5' }}>
          <Typography>Grid Item 3</Typography>
        </Box>
      </Grid>
    </>
  );

  if (container) {
    return (
      <Grid 
        container 
        spacing={spacing}
        columns={columns}
        sx={{ 
          backgroundColor,
          border: '1px dashed #999',
          p: 2
        }}
      >
        {gridContent}
      </Grid>
    );
  } else {
    return (
      <Grid 
        item
        sx={{ 
          backgroundColor,
          border: '1px dashed #999',
          p: 2
        }}
      >
        {children || 'Grid Item Content'}
      </Grid>
    );
  }
};

export default GridWrapper;
