'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Fab, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';
import Link from 'next/link';

import MuiVisualEditor from '@/components/MuiVisualEditor';
import PageRenderer from '@/components/dynamic/PageRenderer';
import { getPageLayout, savePageLayout, PageSection } from '@/lib/firebase/page-editor';

export default function TestPage() {
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLayout = useCallback(async () => {
    setLoading(true);
    const layout = await getPageLayout('test');
    // If no layout is found, initialize with a default Hero section
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
        visible: true,
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
        visible: true,
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
        visible: true,
        backgroundColor: '#ffffff',
        props: {
          title: 'Test Card',
          description: 'This is a test card component',
          content: 'This is the card content'
        },
      },
      {
        id: 'box-1',
        component: 'Box',
        title: 'Box Layout',
        visible: true,
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
        visible: true,
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
        visible: true,
        backgroundColor: '#ffffff',
        props: {
          container: true,
          spacing: 2,
          columns: 12,
        },
      },
    ];
    if (!layout || layout.length === 0) {
      setSections(defaultSections);
    } else {
      setSections(layout);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const handleSaveLayout = useCallback(async () => {
    // Save current sections to Firestore
    await savePageLayout('test', sections);
    setEditorOpen(false);
    // Re-fetch to confirm
    fetchLayout();
  }, [sections, fetchLayout]);

  const handleUpdate = (updatedSections: PageSection[]) => {
    setSections(updatedSections);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageRenderer sections={sections} />

      <MuiVisualEditor
        open={isEditorOpen}
        onClose={() => setEditorOpen(false)}
        sections={sections}
        onUpdate={handleUpdate}
        onSave={handleSaveLayout}
      />

      <Fab
        color="primary"
        aria-label="edit"
        style={{ position: 'fixed', bottom: '50%', right: 16, zIndex: 1050, transform: 'translateY(50%)' }}
        onClick={() => setEditorOpen(true)}
      >
        <EditIcon />
      </Fab>
    </Box>
  );
}
