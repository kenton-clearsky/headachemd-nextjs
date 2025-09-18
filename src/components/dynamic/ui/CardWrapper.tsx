'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CardWrapperProps {
  title?: string;
  description?: string;
  content?: string;
  backgroundColor?: string;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ 
  title = 'Card Title',
  description = 'Card description text',
  content = 'Card content goes here',
  backgroundColor = '#ffffff'
}) => {
  return (
    <div style={{ backgroundColor: backgroundColor, padding: '20px' }}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{content}</p>
        </CardContent>
        <CardFooter>
          <Button>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CardWrapper;
