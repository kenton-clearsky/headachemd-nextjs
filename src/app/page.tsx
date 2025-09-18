'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Fab, Button, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';
import Link from 'next/link';


import PageRenderer from '@/components/dynamic/PageRenderer';
import { PageSection } from '@/lib/firebase/page-editor';
import { config } from '@/lib/config';

export default function Home() {
  
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultSections = [
      {
        id: 'hero-slider-1',
        component: 'HeroSlider',
        title: 'Hero Slider',
        visible: true,
        backgroundColor: '#ffffff',
        props: {},
      },
      {
        id: 'about-1',
        component: 'About',
        title: 'About Section',
        visible: true,
        backgroundColor: '#ffffff',
        props: {},
      },
      {
        id: 'services-1',
        component: 'Services',
        title: 'Services Section',
        visible: true,
        backgroundColor: '#f7f7f7',
        props: {},
      },
      {
        id: 'team-1',
        component: 'Team',
        title: 'Team Section',
        visible: true,
        backgroundColor: '#ffffff',
        props: {},
      },
      {
        id: 'badge-1',
        component: 'Badge',
        title: 'Badge Component',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          children: 'New Badge',
          variant: 'default'
        },
      },
      {
        id: 'button-1',
        component: 'Button',
        title: 'Button Component',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          children: 'Click Me',
          variant: 'default',
          size: 'default'
        },
      },
      {
        id: 'card-1',
        component: 'Card',
        title: 'Card Component',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          title: 'Sample Card',
          description: 'This is a sample card component',
          content: 'This is the card content area.'
        },
      },
      {
        id: 'progress-1',
        component: 'Progress',
        title: 'Progress Component',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          value: 75
        },
      },
      {
        id: 'tabs-1',
        component: 'Tabs',
        title: 'Tabs Component',
        visible: false,
        backgroundColor: '#ffffff',
        props: {},
      },
      {
        id: 'box-1',
        component: 'Box',
        title: 'Box Layout',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          children: 'Box Content',
          padding: 2,
          margin: 2,
        },
      },
      {
        id: 'container-1',
        component: 'Container',
        title: 'Container Layout',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          children: 'Container Content',
          maxWidth: 'lg',
          disableGutters: false,
        },
      },
      {
        id: 'grid-1',
        component: 'Grid',
        title: 'Grid Layout',
        visible: false,
        backgroundColor: '#ffffff',
        props: {
          container: true,
          spacing: 2,
          columns: 12,
        },
      },
    ];
    setSections(defaultSections);
    setLoading(false);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F8E9' }}>

      {loading ? <div>Loading...</div> : <PageRenderer sections={sections} />}
    </Box>
  );
}
