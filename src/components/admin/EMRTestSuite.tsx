'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Settings, 
  Users, 
  Database,
  ExternalLink
} from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export default function EMRTestSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  const runTest = async (testType: string, params?: any) => {
    setIsRunning(true);
    try {
      const response = await fetch(`/api/emr/mock-test?type=${testType}&${new URLSearchParams(params)}`);
      const data = await response.json();
      
      const result: TestResult = {
        test: testType,
        status: response.ok ? 'pass' : 'fail',
        message: data.message || 'Test completed',
        details: data
      };
      
      setTestResults(prev => [...prev, result]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: testType,
        status: 'fail',
        message: 'Test failed with error',
        details: { error: (error as Error).message }
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Configuration test
    await runTest('config');
    
    // OAuth test
    await runTest('oauth', {
      client_id: 'test-client-id',
      redirect_uri: 'http://localhost:3000/api/emr/callback/eclinicalworks',
      scope: 'launch/patient openid profile offline_access',
      state: 'test-state-123',
      code_challenge: 'test-challenge',
      code_challenge_method: 'S256',
      aud: 'https://fhir4.healow.com/fhir/r4',
      launch: 'ehr',
      practice_code: 'DJDIBD'
    });
    
    // Patient search test
    await runTest('patient-search', {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01'
    });
    
    // Patient data test
    await runTest('patient-data', {
      patientId: 'mock-patient-1'
    });
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">WARNING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            EMR Integration Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Comprehensive testing suite for EMR integration validation before deployment.
          </p>
          
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setTestResults([])}
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>

          {testResults.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {testResults.filter(r => r.status === 'pass').length} passed, {' '}
                {testResults.filter(r => r.status === 'fail').length} failed, {' '}
                {testResults.filter(r => r.status === 'warning').length} warnings
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Flow</TabsTrigger>
          <TabsTrigger value="patient">Patient Data</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test environment variables and configuration settings.
              </p>
              <Button 
                onClick={() => runTest('config')}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Test Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Flow Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test OAuth2 authentication flow with eClinicalWorks.
              </p>
              <Button 
                onClick={() => runTest('oauth', {
                  client_id: 'test-client-id',
                  redirect_uri: 'http://localhost:3000/api/emr/callback/eclinicalworks',
                  scope: 'launch/patient openid profile offline_access',
                  state: 'test-state-123'
                })}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Test OAuth Flow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Search Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Test patient search functionality.
                </p>
                <Button 
                  onClick={() => runTest('patient-search', {
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1980-01-01'
                  })}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Test Patient Search
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Data Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Test patient data retrieval.
                </p>
                <Button 
                  onClick={() => runTest('patient-data', {
                    patientId: 'mock-patient-1'
                  })}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Test Patient Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No test results yet. Run some tests to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium capitalize">{result.test.replace('-', ' ')}</span>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
