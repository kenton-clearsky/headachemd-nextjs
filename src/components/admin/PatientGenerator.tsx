'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress,
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { 
  GroupAdd as GroupAddIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';

// Common first names for realistic demographics
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Emily', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen'
];

// Common last names
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell'
];

// Common headache types
const HEADACHE_TYPES = [
  'Migraine', 'Tension', 'Cluster', 'Sinus', 'Hormonal', 'Cervicogenic', 'Rebound',
  'Exertional', 'Ice Cream', 'Thunderclap', 'Hemicrania', 'Occipital Neuralgia'
];

// Common comorbidities
const COMORBIDITIES = [
  'Anxiety', 'Depression', 'Insomnia', 'Fibromyalgia', 'Chronic Fatigue', 'IBS',
  'Asthma', 'Hypertension', 'Diabetes', 'Arthritis', 'Back Pain', 'Neck Pain'
];

// Insurance providers
const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Kaiser',
  'Anthem', 'Molina', 'CareSource', 'Ambetter', 'Medicare', 'Medicaid'
];

// Generate realistic patient data
const generatePatient = (index: number) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  
  // Generate realistic age (18-85)
  const age = 18 + Math.floor(Math.random() * 67);
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  
  // Generate realistic MRN
  const mrn = `MRN${String(index + 4).padStart(3, '0')}`;
  
  // Generate realistic email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
  
  // Generate realistic phone
  const areaCode = ['555', '444', '333', '222', '111'][Math.floor(Math.random() * 5)];
  const prefix = String(Math.floor(Math.random() * 900) + 100);
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  const phone = `(${areaCode}) ${prefix}-${suffix}`;
  
  // Generate realistic address
  const streetNumbers = ['123', '456', '789', '321', '654', '987'];
  const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln'];
  const cities = ['Springfield', 'Riverside', 'Fairview', 'Lakeside', 'Hillcrest', 'Valley View'];
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const zipCodes = ['12345', '23456', '34567', '45678', '56789', '67890'];
  
  const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
  
  // Generate headache profile
  const primaryHeadacheType = HEADACHE_TYPES[Math.floor(Math.random() * HEADACHE_TYPES.length)];
  const secondaryHeadacheType = Math.random() > 0.7 ? 
    HEADACHE_TYPES[Math.floor(Math.random() * HEADACHE_TYPES.length)] : null;
  
  // Generate comorbidities
  const comorbidityCount = Math.floor(Math.random() * 3);
  const comorbidities: string[] = [];
  for (let i = 0; i < comorbidityCount; i++) {
    const comorbidity = COMORBIDITIES[Math.floor(Math.random() * COMORBIDITIES.length)];
    if (!comorbidities.includes(comorbidity)) {
      comorbidities.push(comorbidity);
    }
  }
  
  // Generate insurance
  const insuranceProvider = INSURANCE_PROVIDERS[Math.floor(Math.random() * INSURANCE_PROVIDERS.length)];
  const hasInsurance = Math.random() > 0.1; // 90% have insurance
  
  // Generate family history
  const familyHistory = Math.random() > 0.6 ? 'Migraine in mother' : 
                       Math.random() > 0.5 ? 'Headaches in father' : 'None reported';
  
  // Generate lifestyle factors
  const smokingStatus = Math.random() > 0.8 ? 'Current' : 
                       Math.random() > 0.6 ? 'Former' : 'Never';
  const alcoholUse = Math.random() > 0.7 ? 'Moderate' : 
                    Math.random() > 0.5 ? 'Occasional' : 'None';
  const exerciseFrequency = Math.random() > 0.6 ? '3-4 times/week' : 
                           Math.random() > 0.4 ? '1-2 times/week' : 'Rarely';
  
  // Generate medication allergies
  const medicationAllergies: string[] = Math.random() > 0.8 ? [['Sulfa', 'Penicillin'][Math.floor(Math.random() * 2)]] : [];
  
  // Generate assigned doctors (randomly assign to existing doctors or create new ones)
  const assignedDoctors: string[] = Math.random() > 0.7 ? [['Dr. Smith', 'Dr. Johnson'][Math.floor(Math.random() * 2)]] : [];
  
  return {
    profile: {
      firstName,
      lastName,
      dateOfBirth: new Date(birthYear, birthMonth, birthDay),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      email,
      phone,
      address: {
        street: `${streetNumber} ${streetName}`,
        city,
        state,
        zipCode,
        country: 'USA'
      },
      emergencyContact: {
        name: `${firstName} ${lastName} Sr.`,
        relationship: 'Parent',
        phone: `(${areaCode}) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      }
    },
    mrn,
    headacheProfile: {
      primaryType: primaryHeadacheType,
      secondaryType: secondaryHeadacheType,
      frequency: ['Daily', 'Weekly', 'Monthly', 'Occasional'][Math.floor(Math.random() * 4)],
      typicalDuration: `${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 12) + 8} hours`,
      severity: ['Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
      triggers: ['Stress', 'Lack of sleep', 'Bright lights', 'Certain foods'][Math.floor(Math.random() * 4)],
      aura: Math.random() > 0.7,
      familyHistory,
      comorbidities,
      lifestyleFactors: {
        smoking: smokingStatus,
        alcohol: alcoholUse,
        exercise: exerciseFrequency,
        sleepQuality: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)]
      }
    },
    medicalHistory: {
      surgeries: Math.random() > 0.9 ? ['Appendectomy (2010)'] : [],
      conditions: comorbidities,
      medications: Math.random() > 0.6 ? ['Ibuprofen', 'Acetaminophen'][Math.floor(Math.random() * 2)] : [],
      allergies: medicationAllergies,
      lastPhysicalExam: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    },
    insurance: hasInsurance ? {
      provider: insuranceProvider,
      policyNumber: `POL${String(Math.floor(Math.random() * 900000) + 100000)}`,
      groupNumber: `GRP${String(Math.floor(Math.random() * 90000) + 10000)}`,
      effectiveDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000)
    } : null,
    assignedDoctors,
    currentTreatments: [] as any[],
    appointments: [] as any[],
    dailyUpdates: [] as any[],
    isActive: true,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  };
};

interface PatientGeneratorProps {
  onPatientsGenerated?: () => void;
}

export default function PatientGenerator({ onPatientsGenerated }: PatientGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [patientCount, setPatientCount] = useState<number>(47);

  const generatePatients = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setError('');
      setSuccess('');
      setStatus('🚀 Starting patient generation...');
      
      const patientsToGenerate = patientCount;
      setStatus(`📊 Generating ${patientsToGenerate} new patients...`);
      setProgress(10);
      
      const generatedPatients = [];
      
      for (let i = 0; i < patientsToGenerate; i++) {
        const patient = generatePatient(i);
        generatedPatients.push(patient);
        
        setStatus(`👤 Creating patient ${i + 1}/${patientsToGenerate}: ${patient.profile.firstName} ${patient.profile.lastName}`);
        setProgress(10 + (i * 80 / patientsToGenerate));
        
        try {
          await addDoc(collection(db, 'patients'), {
            ...patient,
            createdAt: Timestamp.fromDate(patient.createdAt),
            updatedAt: Timestamp.fromDate(patient.updatedAt),
            profile: {
              ...patient.profile,
              dateOfBirth: Timestamp.fromDate(patient.profile.dateOfBirth),
              emergencyContact: patient.profile.emergencyContact
            },
            medicalHistory: {
              ...patient.medicalHistory,
              lastPhysicalExam: Timestamp.fromDate(patient.medicalHistory.lastPhysicalExam)
            },
            insurance: patient.insurance ? {
              ...patient.insurance,
              effectiveDate: Timestamp.fromDate(patient.insurance.effectiveDate),
              expirationDate: Timestamp.fromDate(patient.insurance.expirationDate)
            } : null
          });
        } catch (error: any) {
          console.log(`    ⚠️  Patient creation failed: ${error.message}`);
        }
      }
      
      setProgress(100);
      setStatus('🎉 Patient generation completed successfully!');
      setSuccess(`📈 Generated ${patientsToGenerate} new patients! You now have a rich dataset for analytics.`);
      
      // Notify parent component
      if (onPatientsGenerated) {
        onPatientsGenerated();
      }
      
    } catch (error: any) {
      setError(`❌ Error generating patients: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <GroupAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Patient Generator
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate additional patients with realistic demographics, headache profiles, and medical histories. 
          This will create a rich dataset for meaningful analytics and pattern recognition.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Patient Count</InputLabel>
            <Select
              value={patientCount}
              label="Patient Count"
              onChange={(e) => setPatientCount(Number(e.target.value))}
              disabled={isGenerating}
            >
              <MenuItem value={10}>10 patients</MenuItem>
              <MenuItem value={25}>25 patients</MenuItem>
              <MenuItem value={47}>47 patients</MenuItem>
              <MenuItem value={100}>100 patients</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={generatePatients}
            disabled={isGenerating}
            sx={{ mr: 2 }}
          >
            {isGenerating ? 'Generating...' : `Generate ${patientCount} Patients`}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            disabled={isGenerating}
          >
            Refresh Dashboard
          </Button>
        </Box>

        {isGenerating && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {status}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <Chip label="Realistic Demographics" color="primary" size="small" />
          <Chip label="Headache Profiles" color="secondary" size="small" />
          <Chip label="Medical Histories" color="success" size="small" />
          <Chip label="Insurance Data" color="info" size="small" />
          <Chip label="Common Names" color="warning" size="small" />
          <Chip label="Varied Ages" color="error" size="small" />
        </Stack>
      </CardContent>
    </Card>
  );
}
