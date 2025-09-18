'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TabsWrapperProps {
  backgroundColor?: string;
}

const TabsWrapper: React.FC<TabsWrapperProps> = ({ 
  backgroundColor = '#ffffff'
}) => {
  return (
    <div style={{ backgroundColor: backgroundColor, padding: '20px' }}>
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here. Click save when you're done.
        </TabsContent>
        <TabsContent value="password">
          Change your password here. After saving, you'll be logged out.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabsWrapper;
