'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DialogWrapperProps {
  title?: string;
  description?: string;
  open?: boolean;
  backgroundColor?: string;
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({ 
  title = 'Dialog Title',
  description = 'Dialog content goes here',
  open = false,
  backgroundColor = '#ffffff'
}) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <div style={{ backgroundColor: backgroundColor, padding: '20px' }}>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogWrapper;
