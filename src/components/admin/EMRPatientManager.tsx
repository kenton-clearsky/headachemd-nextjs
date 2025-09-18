'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TestPatient {
  id: string;
  emrData: any;
  headacheMDData: any;
  createdAt: string;
  createdBy: string;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mrn: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  conditions: string[];
  medications: string[];
}

export default function EMRPatientManager() {
  const [testPatients, setTestPatients] = useState<TestPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<TestPatient | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'female',
    mrn: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    conditions: [],
    medications: []
  });

  useEffect(() => {
    loadTestPatients();
  }, []);

  const loadTestPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emr/patients');
      const data = await response.json();
      if (data.success) {
        setTestPatients(data.patients);
      }
    } catch (error) {
      console.error('Failed to load test patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPatient = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emr/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_mock' })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadTestPatients();
      }
    } catch (error) {
      console.error('Failed to generate mock patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomPatient = async () => {
    try {
      setLoading(true);
      
      // Convert form data to EMR FHIR format
      const emrPatientData = {
        demographics: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          mrn: formData.mrn || `MRN-${Date.now()}`,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        },
        medicalHistory: {
          conditions: formData.conditions.map(condition => ({
            code: condition.toLowerCase().replace(/\s+/g, '_'),
            display: condition,
            clinicalStatus: 'active',
            verificationStatus: 'confirmed'
          })),
          medications: formData.medications.map(medication => ({
            code: medication.toLowerCase().replace(/\s+/g, '_'),
            display: medication,
            status: 'active'
          })),
          appointments: [],
          observations: []
        }
      };

      const response = await fetch('/api/emr/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create_custom',
          patientData: emrPatientData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadTestPatients();
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create custom patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emr/patients?patientId=${patientId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        await loadTestPatients();
        if (selectedPatient?.id === patientId) {
          setSelectedPatient(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emr/patients?patientId=all', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setTestPatients([]);
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error('Failed to clear patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'female',
      mrn: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      conditions: [],
      medications: []
    });
  };

  const addCondition = () => {
    const condition = prompt('Enter condition/diagnosis:');
    if (condition) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, condition]
      }));
    }
  };

  const addMedication = () => {
    const medication = prompt('Enter medication:');
    if (medication) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, medication]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">EMR Patient Test Data Manager</h2>
        <div className="flex gap-2">
          <Button onClick={generateMockPatient} disabled={loading}>
            Generate Mock Patient
          </Button>
          <Button onClick={() => setShowCreateForm(true)} variant="outline">
            Create Custom Patient
          </Button>
          {testPatients.length > 0 && (
            <Button onClick={clearAllPatients} variant="destructive" disabled={loading}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Test Patients ({testPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testPatients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No test patients yet. Generate or create some to get started.
                </p>
              ) : (
                testPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {patient.emrData?.demographics?.firstName} {patient.emrData?.demographics?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          MRN: {patient.emrData?.demographics?.mrn}
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {new Date(patient.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {patient.id.startsWith('test-') ? 'Mock' : 'Custom'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePatient(patient.id);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPatient ? 'Patient Details' : 'Select a Patient'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">EMR Data (FHIR Format)</h4>
                  <div className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto max-h-48">
                    <pre>{JSON.stringify(selectedPatient.emrData, null, 2)}</pre>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">HeadacheMD Mapped Data</h4>
                  <div className="bg-blue-50 rounded p-3 text-xs font-mono overflow-auto max-h-48">
                    <pre>{JSON.stringify(selectedPatient.headacheMDData, null, 2)}</pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPatient.id);
                    }}
                  >
                    Copy Patient ID
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPatient.emrData.demographics.mrn);
                    }}
                  >
                    Copy MRN
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a patient from the list to view details
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Custom Patient Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Custom EMR Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Conditions/Diagnoses</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary">
                    {condition}
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        conditions: prev.conditions.filter((_, i) => i !== index)
                      }))}
                      className="ml-1 text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={addCondition}>
                Add Condition
              </Button>
            </div>

            <div className="mt-4">
              <Label>Medications</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.medications.map((medication, index) => (
                  <Badge key={index} variant="secondary">
                    {medication}
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        medications: prev.medications.filter((_, i) => i !== index)
                      }))}
                      className="ml-1 text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={addMedication}>
                Add Medication
              </Button>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={createCustomPatient} disabled={loading}>
                Create Patient
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
