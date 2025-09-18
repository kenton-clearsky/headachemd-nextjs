'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  response: any;
  duration: number;
  timestamp: string;
}

export default function EMRTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('test-user-123');
  const [patientId, setPatientId] = useState('test-patient-456');
  const [emrSystem, setEmrSystem] = useState<'epic' | 'cerner' | 'allscripts'>('epic');

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/emr/auth/${emrSystem}?userId=${userId}&redirectUri=${window.location.origin}/callback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addTestResult({
        endpoint: `/api/emr/auth/${emrSystem}`,
        method: 'GET',
        status: response.status,
        response: data,
        duration,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        endpoint: `/api/emr/auth/${emrSystem}`,
        method: 'GET',
        status: 0,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testCallbackEndpoint = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/emr/callback/${emrSystem}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'test-authorization-code',
          state: 'test-state-parameter',
          userId: userId,
        }),
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addTestResult({
        endpoint: `/api/emr/callback/${emrSystem}`,
        method: 'POST',
        status: response.status,
        response: data,
        duration,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        endpoint: `/api/emr/callback/${emrSystem}`,
        method: 'POST',
        status: 0,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testPatientDataEndpoint = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/emr/patient-data/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addTestResult({
        endpoint: `/api/emr/patient-data/${patientId}`,
        method: 'GET',
        status: response.status,
        response: data,
        duration,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        endpoint: `/api/emr/patient-data/${patientId}`,
        method: 'GET',
        status: 0,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    await testAuthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    await testCallbackEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testPatientDataEndpoint();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">EMR Integration Test Suite</h1>
        <p className="text-gray-600">Test the EMR API endpoints and verify functionality</p>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/emr-patients'}
          >
            Manage Test Patients
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/emr-demo'}
          >
            EMR Demo
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/emr-toggle'}
          >
            EMR Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter test user ID"
              />
            </div>
            
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter test patient ID"
              />
            </div>
            
            <div>
              <Label htmlFor="emrSystem">EMR System</Label>
              <select
                id="emrSystem"
                value={emrSystem}
                onChange={(e) => setEmrSystem(e.target.value as 'epic' | 'cerner' | 'allscripts')}
                className="w-full p-2 border rounded-md"
              >
                <option value="epic">Epic</option>
                <option value="cerner">Cerner</option>
                <option value="allscripts">Allscripts</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button 
                onClick={testAuthEndpoint} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Test Auth Endpoint
              </Button>
              
              <Button 
                onClick={testCallbackEndpoint} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Test Callback Endpoint
              </Button>
              
              <Button 
                onClick={testPatientDataEndpoint} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Test Patient Data Endpoint
              </Button>
              
              <Button 
                onClick={testAllEndpoints} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test All Endpoints'}
              </Button>
              
              <Button 
                onClick={clearResults} 
                variant="secondary"
                className="w-full"
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results ({testResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No test results yet. Run some tests to see results here.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {result.method}
                        </Badge>
                        <Badge className={`text-white ${getStatusColor(result.status)}`}>
                          {result.status || 'ERROR'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-sm font-mono text-gray-700">
                      {result.endpoint}
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                      <pre>{JSON.stringify(result.response, null, 2)}</pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EMR Integration Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>EMR Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Auth Endpoint</div>
              <div className="text-xs text-gray-500">OAuth 2.0 Flow</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Callback Handler</div>
              <div className="text-xs text-gray-500">Token Exchange</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Patient Data</div>
              <div className="text-xs text-gray-500">FHIR Integration</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Integration Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Support for Epic, Cerner, and Allscripts EMR systems</li>
              <li>• OAuth 2.0 authentication flow</li>
              <li>• FHIR R4 data transformation</li>
              <li>• Comprehensive audit logging</li>
              <li>• Error handling and validation</li>
              <li>• TypeScript type safety</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
