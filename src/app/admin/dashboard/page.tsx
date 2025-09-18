'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EMRPatientManager from '@/components/admin/EMRPatientManager';
import EMRTestingSuite from '@/components/admin/EMRTestingSuite';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HeadacheMD Admin Dashboard</h1>
        <p className="text-gray-600">Manage patients, EMR integration, and system settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="emr-patients">EMR Patients</TabsTrigger>
          <TabsTrigger value="emr-test">EMR Testing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">EMR Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">eClinicalWorks connected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">EMR test records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default" className="bg-green-500">Online</Badge>
                </div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setActiveTab('emr-patients')}
                  className="h-20 flex flex-col"
                >
                  <span className="text-lg mb-1">👥</span>
                  <span>Manage EMR Patients</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('emr-test')}
                  variant="outline"
                  className="h-20 flex flex-col"
                >
                  <span className="text-lg mb-1">🔧</span>
                  <span>EMR API Testing</span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/emr-demo'}
                  variant="outline"
                  className="h-20 flex flex-col"
                >
                  <span className="text-lg mb-1">🏥</span>
                  <span>EMR Demo</span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/admin/emr-toggle'}
                  variant="outline"
                  className="h-20 flex flex-col"
                >
                  <span className="text-lg mb-1">⚙️</span>
                  <span>EMR Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage HeadacheMD patient records and profiles.</p>
              <Button onClick={() => window.location.href = '/admin'}>
                Go to Patient Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emr-patients" className="space-y-6">
          <EMRPatientManager />
        </TabsContent>

        <TabsContent value="emr-test" className="space-y-6">
          <EMRTestingSuite />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EMR Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">Toggle between mock and real EMR authentication.</p>
                    <Button 
                      onClick={() => window.location.href = '/admin/emr-toggle'}
                      className="w-full"
                    >
                      Manage Auth Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">EMR Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">Configure eClinicalWorks and other EMR systems.</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">eClinicalWorks</span>
                        <Badge variant="default" className="bg-green-500">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Epic</span>
                        <Badge variant="secondary">Configured</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cerner</span>
                        <Badge variant="secondary">Configured</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
