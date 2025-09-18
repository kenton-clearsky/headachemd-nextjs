'use client';

import React from 'react';
import { Drawer, Typography, Divider, Button, Box, IconButton } from '@mui/material';
import { Reorder } from 'framer-motion';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import { PageSection } from '@/lib/firebase/page-editor';

interface MuiVisualEditorProps {
  open: boolean;
  onClose: () => void;
  sections: PageSection[];
  onUpdate: (sections: PageSection[]) => void;
  onSave: () => void;
}

export default function MuiVisualEditor({ open, onClose, sections, onUpdate, onSave }: MuiVisualEditorProps) {
  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = sections.map(sec =>
      sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
    );
    onUpdate(updatedSections);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Visual Editor</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Button onClick={onSave} variant="contained" fullWidth sx={{ mb: 2 }}>
          Save Layout
        </Button>
        <Reorder.Group axis="y" values={sections} onReorder={onUpdate}>
          {sections.map(section => (
            <Reorder.Item key={section.id} value={section}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'grab' }}>
                  <DragIndicatorIcon />
                  <span>{section.title}</span>
                </Box>
                <Button onClick={() => handleToggleVisibility(section.id)} size="small">
                  {section.visible ? 'Hide' : 'Show'}
                </Button>
              </Box>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </Box>
    </Drawer>
  );
}
