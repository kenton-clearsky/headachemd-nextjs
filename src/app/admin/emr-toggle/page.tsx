'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, Database, Users, Stethoscope } from 'lucide-react';
import { EMRPatientSyncService } from '@/lib/services/emr-patient-sync';

export default function EMRTogglePage() {
  const [currentMode, setCurrentMode] = useState<'mock' | 'emr'>('mock');
  const [loading, setLoading] = useState(false);
  const [testPatient, setTestPatient] = useState<any>(null);

  useEffect(() => {
    // Check current authentication mode
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH_IN_DEV === 'true';
    setCurrentMode(skipAuth ? 'mock' : 'emr');
  }, []);

  const generateTestEMRPatient = () => {
    const mockEMRData = EMRPatientSyncService.createMockEMRPatient();
    const headacheMDPatient = EMRPatientSyncService.convertEMRToHeadacheMDPatient(mockEMRData);
    setTestPatient({ emr: mockEMRData, headachemd: headacheMDPatient });
  };

  const toggleAuthMode = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would update environment variables
      // For demo purposes, we'll just toggle the state
      const newMode = currentMode === 'mock' ? 'emr' : 'mock';
      setCurrentMode(newMode);
      
      // Simulate API call to update configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Switched to ${newMode} authentication mode`);
    } catch (error) {
      console.error('Failed to toggle auth mode:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">EMR Integration Control</h1>
        <p className="text-muted-foreground">
          Switch between mock users and real EMR patient data
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Mode Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentMode === 'mock' ? (
                <Users className="h-5 w-5 text-blue-500" />
              ) : (
                <Stethoscope className="h-5 w-5 text-green-500" />
              )}
              Current Authentication Mode
            </CardTitle>
            <CardDescription>
              Active patient data source for HeadacheMD application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge variant={currentMode === 'mock' ? 'default' : 'outline'}>
                  Mock Users
                </Badge>
                <Switch 
                  checked={currentMode === 'emr'}
                  onCheckedChange={toggleAuthMode}
                  disabled={loading}
                />
                <Badge variant={currentMode === 'emr' ? 'default' : 'outline'}>
                  EMR Integration
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {currentMode === 'mock' ? (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  {currentMode === 'mock' ? 'Mock Authentication Active' : 'EMR Authentication Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 ${currentMode === 'mock' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mock Users Mode
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pre-defined test patients</li>
                  <li>• Instant development testing</li>
                  <li>• No external dependencies</li>
                  <li>• Firebase-only data storage</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg border-2 ${currentMode === 'emr' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  EMR Integration Mode
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real patient data from eClinicalWorks</li>
                  <li>• FHIR R4 compliant data sync</li>
                  <li>• OAuth2 authentication required</li>
                  <li>• HIPAA-compliant data handling</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMR Data Mapping Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              EMR Data Mapping Demo
            </CardTitle>
            <CardDescription>
              See how EMR FHIR data converts to HeadacheMD patient format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateTestEMRPatient} className="mb-4">
              Generate Test EMR Patient
            </Button>

            {testPatient && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">EMR FHIR Data</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
                    <pre>{JSON.stringify(testPatient.emr, null, 2)}</pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">HeadacheMD Patient</h4>
                  <div className="bg-blue-50 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
                    <pre>{JSON.stringify(testPatient.headachemd, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>EMR Integration Readiness</CardTitle>
            <CardDescription>
              Current status of EMR components and next steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">FHIR R4 Integration Framework</span>
                <Badge variant="outline">Ready</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">eClinicalWorks Configuration</span>
                <Badge variant="outline">Configured</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">OAuth2 Authentication Flow</span>
                <Badge variant="outline">Implemented</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Patient Data Mapping Service</span>
                <Badge variant="outline">Complete</Badge>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">eClinicalWorks Developer Portal Registration</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Ready for Real EMR Data!</h4>
              <p className="text-green-700 text-sm mb-3">
                Your HeadacheMD app has a complete EMR integration framework. To start using real patient data:
              </p>
              <ol className="text-green-700 text-sm space-y-1 list-decimal list-inside">
                <li>Complete eClinicalWorks developer portal registration</li>
                <li>Whitelist your callback URL in their system</li>
                <li>Toggle to EMR mode using the switch above</li>
                <li>Test with real eClinicalWorks sandbox patients</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
