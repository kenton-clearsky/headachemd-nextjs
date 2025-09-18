'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import BadgeWrapper from '@/components/dynamic/ui/BadgeWrapper';
import ButtonWrapper from '@/components/dynamic/ui/ButtonWrapper';
import CardWrapper from '@/components/dynamic/ui/CardWrapper';
import DialogWrapper from '@/components/dynamic/ui/DialogWrapper';
import ProgressWrapper from '@/components/dynamic/ui/ProgressWrapper';
import TabsWrapper from '@/components/dynamic/ui/TabsWrapper';
import ToasterWrapper from '@/components/dynamic/ui/ToasterWrapper';

export default function ComponentsDemo() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        UI Components Demo
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Badge Component
        </Typography>
        <BadgeWrapper children="Default Badge" variant="default" />
        <BadgeWrapper children="Secondary Badge" variant="secondary" />
        <BadgeWrapper children="Destructive Badge" variant="destructive" />
        <BadgeWrapper children="Outline Badge" variant="outline" />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Button Component
        </Typography>
        <ButtonWrapper children="Default Button" variant="default" size="default" />
        <ButtonWrapper children="Destructive Button" variant="destructive" size="default" />
        <ButtonWrapper children="Outline Button" variant="outline" size="default" />
        <ButtonWrapper children="Secondary Button" variant="secondary" size="default" />
        <ButtonWrapper children="Small Button" variant="default" size="sm" />
        <ButtonWrapper children="Large Button" variant="default" size="lg" />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Card Component
        </Typography>
        <CardWrapper 
          title="Sample Card" 
          description="This is a sample card description" 
          content="This is the card content area where you can put any information you want to display." 
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Dialog Component
        </Typography>
        <DialogWrapper 
          title="Sample Dialog" 
          description="This is a sample dialog that can be opened by clicking the button below." 
          open={false}
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Progress Component
        </Typography>
        <ProgressWrapper value={75} />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Tabs Component
        </Typography>
        <TabsWrapper />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Toaster Component
        </Typography>
        <ToasterWrapper />
      </Box>
    </Container>
  );
}
