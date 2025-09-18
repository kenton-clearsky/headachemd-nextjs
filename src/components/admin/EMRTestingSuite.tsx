'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, User, Calendar, Phone, Mail, MapPin, Pill, Clock } from 'lucide-react';
import { EMRSystem } from '@/types/auth';

interface PatientSearchResult {
  patientId: string;
  mrn: string;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  medicalHistory: {
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
      isActive: boolean;
    }>;
    conditions: string[];
  };
  appointments: Array<{
    id: string;
    scheduledAt: string;
    type: string;
    provider: string;
    status: string;
  }>;
}

export default function EMRTestingSuite() {
  const [activeTab, setActiveTab] = useState('patient-search');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [oauthStatus, setOauthStatus] = useState<string>('Not authenticated');
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    system: EMRSystem.ECLINICALWORKS
  });

  const handlePatientSearch = async () => {
    if (!searchForm.firstName || !searchForm.lastName || !searchForm.dateOfBirth) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const params = new URLSearchParams({
        firstName: searchForm.firstName,
        lastName: searchForm.lastName,
        dateOfBirth: searchForm.dateOfBirth,
        system: searchForm.system
      });

      console.log('🔍 Searching EMR for:', { 
        firstName: searchForm.firstName, 
        lastName: searchForm.lastName, 
        dateOfBirth: searchForm.dateOfBirth,
        system: searchForm.system 
      });

      const response = await fetch(`/api/emr/search?${params}`);
      const data = await response.json();

      console.log('📊 EMR search response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || `Search failed with status ${response.status}`);
      }

      setSearchResults(data);
      if (data.length === 0) {
        setError('No patients found matching the search criteria. Try using sample data: Sarah Johnson, DOB: 1985-03-15');
      }
    } catch (err) {
      console.error('❌ EMR search error:', err);
      setError(`Search failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setActiveTab('patient-details');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            EMR Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Test EMR integration with patient search and data retrieval.</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient-search">Patient Search</TabsTrigger>
          <TabsTrigger value="patient-details">Patient Details</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search EMR Patients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm mb-2">
                  <strong>Sample Test Patients:</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>• Sarah Johnson (1985-03-15)</div>
                  <div>• Michael Chen (1978-09-22)</div>
                  <div>• Emily Rodriguez (1992-07-08)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={searchForm.firstName}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="e.g., Sarah"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={searchForm.lastName}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="e.g., Johnson"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={searchForm.dateOfBirth}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    placeholder="1985-03-15"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="system">EMR System</Label>
                  <select
                    id="system"
                    value={searchForm.system}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, system: e.target.value as EMRSystem }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={EMRSystem.ECLINICALWORKS}>eClinicalWorks</option>
                    <option value={EMRSystem.EPIC}>Epic</option>
                    <option value={EMRSystem.CERNER}>Cerner</option>
                    <option value={EMRSystem.ALLSCRIPTS}>Allscripts</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handlePatientSearch}
                  disabled={isLoading}
                  className="flex-1 md:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Patients
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => {
                    setSearchForm({
                      firstName: 'Sarah',
                      lastName: 'Johnson',
                      dateOfBirth: '1985-03-15',
                      system: EMRSystem.ECLINICALWORKS
                    });
                  }}
                  variant="outline"
                  disabled={isLoading}
                >
                  Use Sample Data
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                  <div className="grid gap-4">
                    {searchResults.map((patient) => (
                      <Card key={patient.patientId} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-semibold">
                                  {patient.demographics.firstName} {patient.demographics.lastName}
                                </span>
                                <Badge variant="secondary">MRN: {patient.mrn}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  DOB: {formatDate(patient.demographics.dateOfBirth)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {patient.demographics.gender}
                                </div>
                              </div>
                              {patient.demographics.phone && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  {patient.demographics.phone}
                                </div>
                              )}
                            </div>
                            <Button 
                              onClick={() => handlePatientSelect(patient)}
                              variant="outline"
                              size="sm"
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient-details" className="space-y-6">
          {selectedPatient ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedPatient.demographics.firstName} {selectedPatient.demographics.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Demographics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">MRN:</span>
                          <span>{selectedPatient.mrn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span>{formatDate(selectedPatient.demographics.dateOfBirth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="capitalize">{selectedPatient.demographics.gender}</span>
                        </div>
                        {selectedPatient.demographics.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{selectedPatient.demographics.phone}</span>
                          </div>
                        )}
                        {selectedPatient.demographics.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{selectedPatient.demographics.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h4>
                      <div className="text-sm">
                        {selectedPatient.demographics.address.street && (
                          <div>{selectedPatient.demographics.address.street}</div>
                        )}
                        {(selectedPatient.demographics.address.city || selectedPatient.demographics.address.state) && (
                          <div>
                            {selectedPatient.demographics.address.city}
                            {selectedPatient.demographics.address.city && selectedPatient.demographics.address.state && ', '}
                            {selectedPatient.demographics.address.state} {selectedPatient.demographics.address.zipCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.medicalHistory.medications.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.medicalHistory.medications.map((med, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{med.name}</div>
                                <div className="text-sm text-gray-600">{med.dosage} - {med.frequency}</div>
                                <div className="text-xs text-gray-500">Started: {formatDate(med.startDate)}</div>
                              </div>
                              <Badge variant={med.isActive ? "default" : "secondary"}>
                                {med.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No medications recorded</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Upcoming Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.appointments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.appointments.map((appt) => (
                          <div key={appt.id} className="border-l-4 border-green-500 pl-3">
                            <div className="font-medium">{appt.type}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(appt.scheduledAt)} with {appt.provider}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {appt.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No upcoming appointments</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedPatient.medicalHistory.allergies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.medicalHistory.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No patient selected. Please search for a patient first.</p>
                <Button 
                  onClick={() => setActiveTab('patient-search')}
                  className="mt-4"
                >
                  Go to Patient Search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="system-status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EMR System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Integration Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>eClinicalWorks</span>
                      <Badge className="bg-green-500">Ready</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Epic</span>
                      <Badge variant="secondary">Configured</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cerner</span>
                      <Badge variant="secondary">Configured</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Allscripts</span>
                      <Badge variant="secondary">Configured</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">API Endpoints</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>/api/emr/search</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>/api/emr/patient</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>/api/emr/callback</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Development Mode:</strong> Currently using mock data for testing. 
                  Real EMR connections require proper authentication and sandbox access.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
