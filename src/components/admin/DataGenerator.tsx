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
  Stack
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  DataUsage as DataIcon
} from '@mui/icons-material';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';

// Pain level patterns (1-10 scale)
const PAIN_PATTERNS = {
  low: [1, 2, 3],
  moderate: [4, 5, 6],
  high: [7, 8, 9],
  severe: [10]
};

// Common headache triggers
const HEADACHE_TRIGGERS = [
  'stress', 'lack of sleep', 'dehydration', 'bright lights',
  'loud noises', 'strong smells', 'weather changes', 'hormonal changes',
  'certain foods', 'caffeine withdrawal', 'eye strain', 'neck tension'
];

// Common medications
const MEDICATIONS = [
  'Ibuprofen', 'Acetaminophen', 'Aspirin', 'Excedrin',
  'Sumatriptan', 'Rizatriptan', 'Naratriptan', 'Zolmitriptan'
];

// Emotional states
const EMOTIONAL_STATES = [
  'frustrated', 'anxious', 'irritable', 'depressed',
  'hopeful', 'calm', 'determined', 'overwhelmed'
];

interface DataGeneratorProps {
  onDataGenerated?: () => void;
}

export default function DataGenerator({ onDataGenerated }: DataGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Generate realistic pain pattern for a month
  const generatePainPattern = (days: number = 30) => {
    const pattern = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Weekend effect (higher pain on weekends)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const weekendMultiplier = isWeekend ? 1.3 : 1.0;
      
      // Stress pattern (higher mid-week)
      const isMidWeek = date.getDay() >= 2 && date.getDay() <= 4;
      const stressMultiplier = isMidWeek ? 1.2 : 1.0;
      
      // Random variation
      const randomFactor = 0.8 + Math.random() * 0.4;
      
      // Base pain level (2-6)
      let basePain = 2 + Math.random() * 4;
      
      // Apply multipliers
      basePain *= weekendMultiplier * stressMultiplier * randomFactor;
      
      // Cap at 10
      const painLevel = Math.min(10, Math.round(basePain));
      
      pattern.push({
        date: date,
        painLevel: painLevel,
        hasHeadache: painLevel >= 4
      });
    }
    
    return pattern;
  };

  // Generate daily update data
  const generateDailyUpdate = (patientId: string, date: Date, painData: any) => {
    const painLevel = painData.painLevel;
    const hasHeadache = painData.hasHeadache;
    
    // Generate realistic data based on pain level
    const headacheFrequency = hasHeadache ? Math.floor(Math.random() * 3) + 1 : 0;
    const sleepHours = hasHeadache ? 5 + Math.random() * 3 : 6 + Math.random() * 3;
    const stressLevel = 1 + Math.random() * 5 + (hasHeadache ? 2 : 0);
    const exerciseMinutes = hasHeadache ? Math.random() * 30 : 30 + Math.random() * 60;
    
    // Generate triggers (more likely with higher pain)
    const triggerCount = hasHeadache ? Math.floor(Math.random() * 3) + 1 : 0;
    const triggers: string[] = [];
    for (let i = 0; i < triggerCount; i++) {
      const trigger = HEADACHE_TRIGGERS[Math.floor(Math.random() * HEADACHE_TRIGGERS.length)];
      if (!triggers.includes(trigger)) {
        triggers.push(trigger);
      }
    }
    
    // Generate medications (more likely with higher pain)
    const medications: string[] = [];
    if (hasHeadache && painLevel >= 6) {
      const medCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < medCount; i++) {
        const med = MEDICATIONS[Math.floor(Math.random() * MEDICATIONS.length)];
        if (!medications.includes(med)) {
          medications.push(med);
        }
      }
    }
    
    // Generate notes
    let notes = '';
    if (hasHeadache) {
      const noteTemplates = [
        `Headache started around ${Math.floor(Math.random() * 12) + 8}:00 AM`,
        `Pain is ${painLevel >= 7 ? 'severe' : painLevel >= 5 ? 'moderate' : 'mild'}`,
        `Triggers: ${triggers.join(', ')}`,
        `Took ${medications.join(', ')} for relief`,
        `Sleep quality: ${sleepHours < 6 ? 'poor' : sleepHours < 7 ? 'fair' : 'good'}`
      ];
      notes = noteTemplates.slice(0, 2 + Math.floor(Math.random() * 2)).join('. ');
    }
    
    return {
      patientId: patientId,
      date: Timestamp.fromDate(date),
      painLevel: painLevel,
      headacheFrequency: headacheFrequency,
      triggers: triggers,
      medications: medications,
      sleepHours: Math.round(sleepHours * 10) / 10,
      stressLevel: Math.round(stressLevel),
      exerciseMinutes: Math.round(exerciseMinutes),
      notes: notes,
      mood: EMOTIONAL_STATES[Math.floor(Math.random() * EMOTIONAL_STATES.length)],
      functionalStatus: painLevel >= 8 ? 'severely_limited' : 
                       painLevel >= 6 ? 'moderately_limited' : 
                       painLevel >= 4 ? 'slightly_limited' : 'normal',
      createdAt: Timestamp.fromDate(new Date())
    };
  };

  // Generate headache log entry
  const generateHeadacheLog = (patientId: string, date: Date, painData: any) => {
    if (!painData.hasHeadache) return null;
    
    return {
      userId: patientId,
      timestamp: Timestamp.fromDate(date),
      painLevel: painData.painLevel,
      duration: Math.floor(Math.random() * 8) + 1, // 1-8 hours
      location: ['left side', 'right side', 'both sides', 'forehead', 'back of head'][Math.floor(Math.random() * 5)],
      intensity: painData.painLevel >= 8 ? 'severe' : painData.painLevel >= 6 ? 'moderate' : 'mild',
      triggers: generateDailyUpdate(patientId, date, painData).triggers,
      medications: generateDailyUpdate(patientId, date, painData).medications,
      notes: `Headache episode on ${date.toLocaleDateString()}`,
      createdAt: Timestamp.fromDate(new Date())
    };
  };

  // Generate medication log entry
  const generateMedicationLog = (patientId: string, date: Date, painData: any) => {
    const dailyUpdate = generateDailyUpdate(patientId, date, painData);
    if (dailyUpdate.medications.length === 0) return null;
    
    return {
      userId: patientId,
      timestamp: Timestamp.fromDate(date),
      medication: dailyUpdate.medications[0],
      dosage: ['100mg', '200mg', '500mg', '1 tablet'][Math.floor(Math.random() * 4)],
      effectiveness: painData.painLevel >= 7 ? 'partial' : 'effective',
      sideEffects: Math.random() > 0.8 ? ['nausea', 'dizziness'][Math.floor(Math.random() * 2)] : [],
      notes: `Taken for ${painData.painLevel >= 7 ? 'severe' : 'moderate'} headache`,
      createdAt: Timestamp.fromDate(new Date())
    };
  };

  // Generate user analytics event
  const generateAnalyticsEvent = (patientId: string, date: Date, painData: any) => {
    return {
      userId: patientId,
      type: 'daily_update',
      category: 'health_tracking',
      action: 'record',
      label: painData.hasHeadache ? 'headache_day' : 'pain_free_day',
      value: painData.painLevel,
      metadata: {
        date: date.toISOString(),
        painLevel: painData.painLevel,
        hasHeadache: painData.hasHeadache,
        triggers: generateDailyUpdate(patientId, date, painData).triggers.length
      },
      timestamp: Timestamp.fromDate(date),
      createdAt: new Date().toISOString()
    };
  };

  // Main function to generate all test data
  const generateTestData = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setError('');
      setSuccess('');
      setStatus('🚀 Starting test data generation...');
      
      // Get all existing patients
      setStatus('📊 Fetching patients...');
      setProgress(10);
      
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      const patients: any[] = [];
      
      patientsSnapshot.forEach(doc => {
        patients.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setStatus(`📊 Found ${patients.length} patients to generate data for`);
      setProgress(20);
      
      if (patients.length === 0) {
        setError('❌ No patients found. Please create patients first.');
        return;
      }
      
      // Generate data for each patient
      for (let i = 0; i < patients.length; i++) {
        const patient = patients[i];
        setStatus(`👤 Generating data for patient: ${patient.profile?.firstName || 'Unknown'} ${patient.profile?.lastName || ''}`);
        setProgress(20 + (i * 60 / patients.length));
        
        // Generate pain pattern for the past month
        const painPattern = generatePainPattern(30);
        
        // Generate daily updates
        const dailyUpdates: any[] = [];
        const headacheLogs: any[] = [];
        const medicationLogs: any[] = [];
        const analyticsEvents: any[] = [];
        
        for (const painData of painPattern) {
          // Daily update
          const dailyUpdate = generateDailyUpdate(patient.id, painData.date, painData);
          dailyUpdates.push(dailyUpdate);
          
          // Headache log (if headache occurred)
          const headacheLog = generateHeadacheLog(patient.id, painData.date, painData);
          if (headacheLog) {
            headacheLogs.push(headacheLog);
          }
          
          // Medication log (if medication taken)
          const medicationLog = generateMedicationLog(patient.id, painData.date, painData);
          if (medicationLog) {
            medicationLogs.push(medicationLog);
          }
          
          // Analytics event
          const analyticsEvent = generateAnalyticsEvent(patient.id, painData.date, painData);
          analyticsEvents.push(analyticsEvent);
        }
        
        // Save daily updates
        setStatus(`  📅 Creating ${dailyUpdates.length} daily updates...`);
        for (const update of dailyUpdates) {
          try {
            await addDoc(collection(db, 'dailyUpdates'), update);
          } catch (error: any) {
            console.log(`    ⚠️  Daily update creation failed: ${error.message}`);
          }
        }
        
        // Save headache logs
        setStatus(`  🧠 Creating ${headacheLogs.length} headache logs...`);
        for (const log of headacheLogs) {
          try {
            await addDoc(collection(db, 'headache_logs'), log);
          } catch (error: any) {
            console.log(`    ⚠️  Headache log creation failed: ${error.message}`);
          }
        }
        
        // Save medication logs
        setStatus(`  💊 Creating ${medicationLogs.length} medication logs...`);
        for (const log of medicationLogs) {
          try {
            await addDoc(collection(db, 'medication_logs'), log);
          } catch (error: any) {
            console.log(`    ⚠️  Medication log creation failed: ${error.message}`);
          }
        }
        
        // Save analytics events
        setStatus(`  📊 Creating ${analyticsEvents.length} analytics events...`);
        for (const event of analyticsEvents) {
          try {
            await addDoc(collection(db, 'user_analytics'), event);
          } catch (error: any) {
            console.log(`    ⚠️  Analytics event creation failed: ${error.message}`);
          }
        }
        
        setStatus(`  ✅ Completed data generation for ${patient.profile?.firstName || 'Unknown'}`);
      }
      
      setProgress(100);
      setStatus('🎉 Test data generation completed successfully!');
      setSuccess(`📈 Generated data for ${patients.length} patients over the past 30 days! Refresh your dashboard to see the new analytics data.`);
      
      // Notify parent component
      if (onDataGenerated) {
        onDataGenerated();
      }
      
    } catch (error: any) {
      setError(`❌ Error generating test data: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <DataIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Test Data Generator
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate realistic headache tracking data for the past 30 days for all existing patients. 
          This will create daily updates, headache logs, medication tracking, and analytics events.
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
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={generateTestData}
            disabled={isGenerating}
            sx={{ mr: 2 }}
          >
            {isGenerating ? 'Generating...' : 'Generate Test Data'}
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
          <Chip label="Daily Updates" color="primary" size="small" />
          <Chip label="Headache Logs" color="secondary" size="small" />
          <Chip label="Medication Tracking" color="success" size="small" />
          <Chip label="Analytics Events" color="info" size="small" />
          <Chip label="30 Days of Data" color="warning" size="small" />
        </Stack>
      </CardContent>
    </Card>
  );
}
