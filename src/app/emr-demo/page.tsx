'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EMRTestResult {
  system: string;
  status: string;
  config: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    apiBaseUrl: string;
    scopes: string[];
  };
  authUrl: string;
  connectivity: {
    status: string;
    fhirVersion?: string;
    software?: string;
    error?: string;
  };
  nextSteps: string[];
}

export default function EMRDemoPage() {
  const [testResult, setTestResult] = useState<EMRTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEMRConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/emr/test?system=eclinicalworks');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startOAuthFlow = () => {
    if (testResult?.authUrl) {
      window.open(testResult.authUrl, '_blank', 'width=600,height=700');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">EMR Integration Demo</h1>
        <p className="text-muted-foreground">
          Test eClinicalWorks FHIR integration and OAuth2 authentication flow
        </p>
      </div>

      <div className="grid gap-6">
        {/* Test Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              EMR Connection Test
            </CardTitle>
            <CardDescription>
              Verify eClinicalWorks FHIR endpoint connectivity and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testEMRConnection} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test EMR Connection'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Connection Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {testResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Configuration Status</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={testResult.config.clientId === '***configured***' ? 'default' : 'destructive'}>
                          Client ID: {testResult.config.clientId}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={testResult.config.clientSecret === '***configured***' ? 'default' : 'destructive'}>
                          Client Secret: {testResult.config.clientSecret}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Connectivity</h4>
                    <div className="space-y-1">
                      <Badge variant={testResult.connectivity.status === 'reachable' ? 'default' : 'destructive'}>
                        Status: {testResult.connectivity.status}
                      </Badge>
                      {testResult.connectivity.fhirVersion && (
                        <div className="text-sm text-muted-foreground">
                          FHIR Version: {testResult.connectivity.fhirVersion}
                        </div>
                      )}
                      {testResult.connectivity.software && (
                        <div className="text-sm text-muted-foreground">
                          Software: {testResult.connectivity.software}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">FHIR Endpoints</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div><strong>Auth URL:</strong> {testResult.config.authUrl}</div>
                    <div><strong>Token URL:</strong> {testResult.config.tokenUrl}</div>
                    <div><strong>API Base:</strong> {testResult.config.apiBaseUrl}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Scopes</h4>
                  <div className="flex flex-wrap gap-1">
                    {testResult.config.scopes.map((scope, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OAuth Flow Card */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-500" />
                OAuth2 Authentication Flow
              </CardTitle>
              <CardDescription>
                Test the complete OAuth2 flow with eClinicalWorks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Ready to Test OAuth Flow</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Click the button below to start the OAuth2 authentication flow. 
                    This will open eClinicalWorks login in a new window.
                  </p>
                  <Button onClick={startOAuthFlow} className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Start OAuth Flow
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Next Steps</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {testResult.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                  <strong>Generated Auth URL:</strong><br />
                  <span className="font-mono break-all">{testResult.authUrl}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Current state of EMR integration in HeadacheMD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">EMR Integration Framework: Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">eClinicalWorks Credentials: Configured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">FHIR R4 Endpoints: Available</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Mock Authentication: Currently Active</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Next:</strong> Once OAuth flow is tested successfully, you can disable mock authentication 
                and enable real EMR user authentication in your environment variables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
