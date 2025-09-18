'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Snackbar,
  Fab,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as DatabaseIcon,
  Collections as CollectionsIcon,
  DocumentScanner as DocumentScannerIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Event as EventIcon,
  Article as ArticleIcon,
  QuestionAnswer as QuestionIcon,
  ContactSupport as ContactIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Star as StarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Medication as MedicationIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
} from '@mui/icons-material';
import { collection, getDocs, query, limit, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import EmotionsHeadacheManager from './EmotionsHeadacheManager';

interface CollectionData {
  name: string;
  count: number;
  sampleDocuments: any[];
  lastUpdated?: Date;
}

interface DocumentData {
  id: string;
  data: any;
}

export default function DatabaseExplorer() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDocument, setNewDocument] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();

  const getCollectionDisplayName = (collectionName: string): string => {
    const displayNames: { [key: string]: string } = {
      'users': 'Users',
      'patients': 'Patients',
      'treatments': 'Treatments',
      'appointments': 'Appointments',
      'analytics': 'Analytics',
      'content': 'Content',
      'settings': 'Settings',
      'notifications': 'Notifications',
      'reports': 'Reports',
      'medications': 'Medications',
      'symptoms': 'Symptoms',
      'diagnoses': 'Diagnoses',
      'insurance': 'Insurance',
      'billing': 'Billing',
      'referrals': 'Referrals',
      'consults': 'Consultations',
      'testResults': 'Test Results',
      'imaging': 'Imaging',
      'prescriptions': 'Prescriptions',
      'allergies': 'Allergies',
      'familyHistory': 'Family History',
      'socialHistory': 'Social History',
      'vitalSigns': 'Vital Signs',
      'labResults': 'Lab Results',
      'procedures': 'Procedures',
      'surgeries': 'Surgeries',
      'followUps': 'Follow-ups',
      'emergencyContacts': 'Emergency Contacts',
      'carePlans': 'Care Plans',
      'goals': 'Treatment Goals',
      'assessments': 'Assessments',
      'evaluations': 'Evaluations',
      'dischargeNotes': 'Discharge Notes',
      'admissionNotes': 'Admission Notes',
      'progressNotes': 'Progress Notes',
      'consultationNotes': 'Consultation Notes',
      'referralNotes': 'Referral Notes',
      'prescriptionNotes': 'Prescription Notes',
      'medicationNotes': 'Medication Notes',
      'allergyNotes': 'Allergy Notes',
      'familyHistoryNotes': 'Family History Notes',
      'socialHistoryNotes': 'Social History Notes',
      'vitalSignsNotes': 'Vital Signs Notes',
      'labResultsNotes': 'Lab Results Notes',
      'procedureNotes': 'Procedure Notes',
      'surgeryNotes': 'Surgery Notes',
      'followUpNotes': 'Follow-up Notes',
      'emergencyContactNotes': 'Emergency Contact Notes',
      'carePlanNotes': 'Care Plan Notes',
      'goalNotes': 'Treatment Goal Notes',
      'assessmentNotes': 'Assessment Notes',
      'evaluationNotes': 'Evaluation Notes'
    };
    
    return displayNames[collectionName] || collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
  };

  const getAssetTypeName = (collectionName: string): string => {
    const assetTypes: { [key: string]: string } = {
      'users': 'User',
      'patients': 'Patient',
      'treatments': 'Treatment',
      'appointments': 'Appointment',
      'analytics': 'Analytics Record',
      'content': 'Content Item',
      'settings': 'Setting',
      'notifications': 'Notification',
      'reports': 'Report',
      'medications': 'Medication',
      'symptoms': 'Symptom',
      'diagnoses': 'Diagnosis',
      'insurance': 'Insurance Record',
      'billing': 'Billing Record',
      'referrals': 'Referral',
      'consults': 'Consultation',
      'testResults': 'Test Result',
      'imaging': 'Imaging Study',
      'prescriptions': 'Prescription',
      'allergies': 'Allergy',
      'familyHistory': 'Family History Record',
      'socialHistory': 'Social History Record',
      'vitalSigns': 'Vital Signs Record',
      'labResults': 'Lab Result',
      'procedures': 'Procedure',
      'surgeries': 'Surgery',
      'followUps': 'Follow-up',
      'emergencyContacts': 'Emergency Contact',
      'carePlans': 'Care Plan',
      'goals': 'Treatment Goal',
      'assessments': 'Assessment',
      'evaluations': 'Evaluation',
      'dischargeNotes': 'Discharge Note',
      'admissionNotes': 'Admission Note',
      'progressNotes': 'Progress Note',
      'consultationNotes': 'Consultation Note',
      'referralNotes': 'Referral Note',
      'prescriptionNotes': 'Prescription Note',
      'medicationNotes': 'Medication Note',
      'allergyNotes': 'Allergy Note',
      'familyHistoryNotes': 'Family History Note',
      'socialHistoryNotes': 'Social History Note',
      'vitalSignsNotes': 'Vital Signs Note',
      'labResultsNotes': 'Lab Result Note',
      'procedureNotes': 'Procedure Note',
      'surgeryNotes': 'Surgery Note',
      'followUpNotes': 'Follow-up Note',
      'emergencyContactNotes': 'Emergency Contact Note',
      'carePlanNotes': 'Care Plan Note',
      'goalNotes': 'Treatment Goal Note',
      'assessmentNotes': 'Assessment Note',
      'evaluationNotes': 'Evaluation Note'
    };
    
    return assetTypes[collectionName] || 'Record';
  };

  const getDefaultFieldsForCollection = (collectionName: string) => {
    const defaultFields: { [key: string]: any } = {
      'medications': {
        name: '',
        genericName: '',
        dosage: '',
        frequency: '',
        route: '',
        strength: '',
        manufacturer: '',
        description: '',
        sideEffects: '',
        contraindications: '',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      'treatments': {
        name: '',
        description: '',
        duration: '',
        frequency: '',
        instructions: '',
        expectedOutcome: '',
        risks: '',
        alternatives: '',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      'emotions': {
        name: '',
        description: '',
        intensity: '',
        triggers: '',
        symptoms: '',
        copingStrategies: '',
        relatedConditions: '',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      'patients': {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    };
    
    return defaultFields[collectionName] || { name: '', description: '', isActive: true, createdAt: new Date().toISOString() };
  };

  const populateSampleData = (collectionName: string) => {
    const sampleData: { [key: string]: any[] } = {
      'patients': [
        {
          mrn: 'MRN001',
          userId: 'user-1',
          profile: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            phone: '(555) 123-4567',
            dateOfBirth: new Date('1985-03-15'),
            gender: 'female',
            address: {
              street: '123 Main St',
              city: 'Austin',
              state: 'TX',
              zipCode: '78701',
              country: 'USA'
            },
            emergencyContact: {
              name: 'Mike Johnson',
              relationship: 'spouse',
              phoneNumber: '(555) 123-4568'
            }
          },
          medicalHistory: {
            allergies: ['Penicillin', 'Shellfish'],
            medications: ['Sumatriptan 50mg', 'Propranolol 40mg'],
            chronicConditions: ['Migraine', 'Hypertension'],
            familyHistory: ['Migraine (mother)', 'Heart disease (father)']
          },
          headacheProfile: {
            onsetAge: 16,
            frequency: 'weekly',
            severity: 8,
            triggers: ['stress', 'bright lights', 'wine'],
            symptoms: ['nausea', 'photophobia', 'phonophobia'],
            location: 'unilateral',
            duration: '4-12 hours'
          },
          insurance: {
            provider: 'Blue Cross Blue Shield',
            policyNumber: 'BC123456789',
            groupNumber: 'GRP001'
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          mrn: 'MRN002',
          userId: 'user-2',
          profile: {
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@email.com',
            phone: '(555) 234-5678',
            dateOfBirth: new Date('1978-11-22'),
            gender: 'male',
            address: {
              street: '456 Oak Ave',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94102',
              country: 'USA'
            },
            emergencyContact: {
              name: 'Lisa Chen',
              relationship: 'wife',
              phoneNumber: '(555) 234-5679'
            }
          },
          medicalHistory: {
            allergies: ['Aspirin'],
            medications: ['Rizatriptan 10mg', 'Topiramate 25mg'],
            chronicConditions: ['Cluster headache', 'Sleep apnea'],
            familyHistory: ['Diabetes (father)']
          },
          headacheProfile: {
            onsetAge: 25,
            frequency: 'daily',
            severity: 9,
            triggers: ['alcohol', 'sleep deprivation', 'strong odors'],
            symptoms: ['severe pain', 'restlessness', 'nasal congestion'],
            location: 'orbital',
            duration: '30-90 minutes'
          },
          insurance: {
            provider: 'Kaiser Permanente',
            policyNumber: 'KP987654321',
            groupNumber: 'GRP002'
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'medications': [
        {
          name: 'Ibuprofen',
          genericName: 'Ibuprofen',
          dosage: '400mg',
          frequency: 'Every 6 hours as needed',
          route: 'Oral',
          strength: '400mg',
          manufacturer: 'Generic',
          description: 'Non-steroidal anti-inflammatory drug for pain and fever',
          sideEffects: 'Stomach upset, dizziness, headache',
          contraindications: 'Allergy to NSAIDs, active stomach ulcers',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Sumatriptan',
          genericName: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed for migraine',
          route: 'Oral',
          strength: '50mg',
          manufacturer: 'Generic',
          description: 'Serotonin receptor agonist for acute migraine treatment',
          sideEffects: 'Dizziness, fatigue, chest tightness',
          contraindications: 'Coronary artery disease, uncontrolled hypertension',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      'treatments': [
        {
          name: 'Cognitive Behavioral Therapy',
          description: 'Psychological treatment for managing chronic pain and stress',
          duration: '8-12 weeks',
          frequency: 'Weekly sessions',
          instructions: 'Regular practice of relaxation techniques and cognitive restructuring',
          expectedOutcome: 'Reduced pain perception and improved coping skills',
          risks: 'Minimal, may cause temporary emotional discomfort',
          alternatives: 'Mindfulness meditation, biofeedback, physical therapy',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Physical Therapy Program',
          description: 'Structured exercise program for neck and shoulder tension',
          duration: '6-8 weeks',
          frequency: '3 times per week',
          instructions: 'Perform stretching and strengthening exercises as prescribed',
          expectedOutcome: 'Improved range of motion and reduced muscle tension',
          risks: 'Minor muscle soreness, rare risk of injury',
          alternatives: 'Massage therapy, chiropractic care, acupuncture',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      'emotions': [
        {
          name: 'Anxiety',
          description: 'Feeling of worry, nervousness, or unease',
          intensity: 'Moderate',
          triggers: 'Stress, lack of sleep, caffeine, certain situations',
          symptoms: 'Rapid heartbeat, sweating, restlessness, difficulty concentrating',
          copingStrategies: 'Deep breathing, progressive muscle relaxation, mindfulness',
          relatedConditions: 'Depression, panic disorder, chronic pain',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Depression',
          description: 'Persistent feeling of sadness and loss of interest',
          intensity: 'High',
          triggers: 'Life changes, trauma, chronic illness, genetic factors',
          symptoms: 'Persistent sadness, fatigue, changes in appetite, sleep disturbances',
          copingStrategies: 'Therapy, medication, exercise, social support',
          relatedConditions: 'Anxiety, chronic pain, substance abuse',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]
    };
    
    return sampleData[collectionName] || [];
  };

  useEffect(() => {
    exploreDatabase();
  }, []);

  const exploreDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Common collections to check
      const commonCollections = [
        'users',
        'patients',
        'analytics',
        'treatments',
        'medications',
        'emotions',
        'appointments',
        'doctors',
        'clinics',
        'news',
        'blog',
        'testimonials',
        'faqs',
        'contact_messages',
        'settings',
        'page_content',
        'landing_sections',
        'hero_slides',
        'services',
        'team_members',
        'about_content',
        'contact_info'
      ];

      const collectionsData: CollectionData[] = [];

      for (const collectionName of commonCollections) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(query(collectionRef, limit(5)));
          
          if (!snapshot.empty) {
            const sampleDocs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Ensure we have valid documents before adding to collections
            if (sampleDocs && sampleDocs.length > 0) {
              collectionsData.push({
                name: collectionName,
                count: snapshot.size,
                sampleDocuments: sampleDocs,
                lastUpdated: new Date()
              });
            }
          }
        } catch (err) {
          console.log(`Collection ${collectionName} not accessible or doesn't exist`);
        }
      }

      // Sort by count (most populated first)
      collectionsData.sort((a, b) => b.count - a.count);
      
      // Filter out any collections that don't have the proper structure
      const validCollections = collectionsData.filter(collection => 
        collection.sampleDocuments && Array.isArray(collection.sampleDocuments)
      );
      
      console.log('Collections data:', collectionsData);
      console.log('Valid collections:', validCollections);
      console.log('Collections data structure:', validCollections.map(c => ({ name: c.name, count: c.count, documentsLength: c.sampleDocuments?.length })));
      
      setCollections(validCollections);
      
    } catch (err) {
      console.error('Error exploring database:', err);
      setError('Failed to explore database. Please check your Firebase connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentView = (document: DocumentData, collectionName: string) => {
    setSelectedDocument(document);
    setSelectedCollection(collectionName);
    setOpenModal(true);
  };

  const handleAddDocumentToCollection = (collectionName: string) => {
    setSelectedCollection(collectionName);
    const defaultFields = getDefaultFieldsForCollection(collectionName);
    setNewDocument(defaultFields);
    setOpenAddModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDocument(null);
    setEditingDocument(null);
    setIsEditing(false);
  };

  const handleEditDocument = (document: DocumentData) => {
    setEditingDocument({ ...document });
    setIsEditing(true);
  };

  const handleSaveDocument = async () => {
    if (!editingDocument) return;
    
    try {
      const docRef = doc(db, selectedCollection, editingDocument.data.id);
      const { id, ...updateData } = editingDocument.data;
      await updateDoc(docRef, updateData);
      
      setSnackbar({
        open: true,
        message: `${getAssetTypeName(selectedCollection)} updated successfully!`,
        severity: 'success'
      });
      
      // Refresh the data
      exploreDatabase();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating document:', error);
      setSnackbar({
        open: true,
        message: `Failed to update ${getAssetTypeName(selectedCollection).toLowerCase()}. Please try again.`,
        severity: 'error'
      });
    }
  };

  const handleDeleteDocument = async (document: DocumentData, collectionName: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${getAssetTypeName(collectionName).toLowerCase()}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const docRef = doc(db, collectionName, document.data.id);
      await deleteDoc(docRef);
      
      setSnackbar({
        open: true,
        message: `${getAssetTypeName(collectionName)} deleted successfully!`,
        severity: 'success'
      });
      
      // Refresh the data
      exploreDatabase();
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete ${getAssetTypeName(collectionName).toLowerCase()}. Please try again.`,
        severity: 'error'
      });
    }
  };

  const handleAddDocument = async () => {
    if (!selectedCollection || Object.keys(newDocument).length === 0) return;
    
    try {
      // Add timestamp fields
      const documentData = {
        ...newDocument,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, selectedCollection), documentData);
      
      setSnackbar({
        open: true,
        message: `${getAssetTypeName(selectedCollection)} added successfully!`,
        severity: 'success'
      });
      
      // Reset and refresh
      setNewDocument({});
      setOpenAddModal(false);
      setSelectedCollection('');
      exploreDatabase();
    } catch (error) {
      console.error('Error adding document:', error);
      setSnackbar({
        open: true,
        message: `Failed to add ${getAssetTypeName(selectedCollection).toLowerCase()}. Please try again.`,
        severity: 'error'
      });
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    if (editingDocument) {
      setEditingDocument({
        ...editingDocument,
        data: {
          ...editingDocument.data,
          [key]: value
        }
      });
    }
  };

  const handleNewFieldChange = (key: string, value: any) => {
    setNewDocument({
      ...newDocument,
      [key]: value
    });
  };

  const addNewField = () => {
    const fieldName = `field_${Object.keys(newDocument).length + 1}`;
    setNewDocument({
      ...newDocument,
      [fieldName]: ''
    });
  };

  const removeField = (fieldName: string) => {
    const updatedDoc = { ...newDocument };
    delete updatedDoc[fieldName];
    setNewDocument(updatedDoc);
  };

  const toggleCollection = (collectionName: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionName)) {
      newExpanded.delete(collectionName);
    } else {
      newExpanded.add(collectionName);
    }
    setExpandedCollections(newExpanded);
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
        const date = new Date(dateValue.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Handle regular Date objects or ISO strings
      if (dateValue instanceof Date || typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Handle timestamp numbers
      if (typeof dateValue === 'number') {
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return String(dateValue);
    } catch (error) {
      return String(dateValue);
    }
  };

  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    // Handle dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at') || key.toLowerCase().includes('time')) {
      return formatDate(value);
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Handle numbers
    if (typeof value === 'number') {
      // Format currency
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('amount')) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      }
      // Format percentages
      if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate')) {
        return `${value}%`;
      }
      // Format phone numbers
      if (key.toLowerCase().includes('phone') && value.toString().length >= 10) {
        const phoneStr = value.toString().replace(/\D/g, '');
        if (phoneStr.length === 10) {
          return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
        } else if (phoneStr.length === 11 && phoneStr.startsWith('1')) {
          return `+1 (${phoneStr.slice(1, 4)}) ${phoneStr.slice(4, 7)}-${phoneStr.slice(7)}`;
        }
      }
      // Format regular numbers with commas
      return new Intl.NumberFormat('en-US').format(value);
    }
    
    // Handle strings
    if (typeof value === 'string') {
      // Format email addresses
      if (key.toLowerCase().includes('email')) {
        return value;
      }
      // Format URLs
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link') || value.startsWith('http')) {
        return value;
      }
      // Format long strings
      if (value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Empty';
      if (value.length <= 3) return value.join(', ');
      return `${value.length} items: ${value.slice(0, 3).join(', ')}...`;
    }
    
    // Handle objects
    if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value);
      if (keys.length === 0) return 'Empty object';
      if (keys.length <= 3) return `${keys.length} fields: ${keys.join(', ')}`;
      return `${keys.length} fields: ${keys.slice(0, 3).join(', ')}...`;
    }
    
    return String(value);
  };

  const formatFieldName = (key: string): string => {
    // Common field name mappings
    const fieldMappings: { [key: string]: string } = {
      'id': 'ID',
      'userId': 'User ID',
      'patientId': 'Patient ID',
      'doctorId': 'Doctor ID',
      'clinicId': 'Clinic ID',
      'appointmentId': 'Appointment ID',
      'treatmentId': 'Treatment ID',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'fullName': 'Full Name',
      'displayName': 'Display Name',
      'dateOfBirth': 'Date of Birth',
      'phoneNumber': 'Phone Number',
      'emailAddress': 'Email Address',
      'streetAddress': 'Street Address',
      'city': 'City',
      'state': 'State',
      'zipCode': 'ZIP Code',
      'country': 'Country',
      'isActive': 'Active Status',
      'isVerified': 'Verification Status',
      'profileComplete': 'Profile Complete',
      'privacyPolicy': 'Privacy Policy Accepted',
      'createdAt': 'Created Date',
      'updatedAt': 'Updated Date',
      'lastLogin': 'Last Login',
      'appointmentDate': 'Appointment Date',
      'scheduledTime': 'Scheduled Time',
      'duration': 'Duration (minutes)',
      'status': 'Status',
      'notes': 'Notes',
      'prescribedBy': 'Prescribed By',
      'dosage': 'Dosage',
      'sideEffects': 'Side Effects',
      'instructions': 'Instructions',
      'insuranceProvider': 'Insurance Provider',
      'policyNumber': 'Policy Number',
      'coverageType': 'Coverage Type',
      'deductible': 'Deductible',
      'copay': 'Copay',
      'headacheProfile': 'Headache Profile',
      'dailyUpdates': 'Daily Updates',
      'assignedDoctors': 'Assigned Doctors',
      'medicalHistory': 'Medical History',
      'allergies': 'Allergies',
      'medications': 'Current Medications',
      'emergencyContact': 'Emergency Contact',
      'nextOfKin': 'Next of Kin',
      'preferredLanguage': 'Preferred Language',
      'accessibilityNeeds': 'Accessibility Needs',
      'paymentMethod': 'Payment Method',
      'billingAddress': 'Billing Address',
      'consentForms': 'Consent Forms',
      'treatmentPlan': 'Treatment Plan',
      'progressNotes': 'Progress Notes',
      'followUpDate': 'Follow-up Date',
      'referralSource': 'Referral Source',
      'symptoms': 'Symptoms',
      'diagnosis': 'Diagnosis',
      'prognosis': 'Prognosis',
      'recommendations': 'Recommendations'
    };
    
    // Check for exact matches first
    if (fieldMappings[key]) {
      return fieldMappings[key];
    }
    
    // Check for partial matches
    for (const [pattern, replacement] of Object.entries(fieldMappings)) {
      if (key.toLowerCase().includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(key.toLowerCase())) {
        return replacement;
      }
    }
    
    // Default formatting: convert snake_case or camelCase to Title Case
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCollectionIcon = (collectionName: string) => {
    const iconMap: { [key: string]: any } = {
      users: <PersonIcon />,
      patients: <PersonIcon />,
      treatments: <HealingIcon />,
      medications: <MedicationIcon />,
      emotions: <PsychologyIcon />,
      appointments: <EventIcon />,
      doctors: <HospitalIcon />,
      analytics: <DescriptionIcon />,
      settings: <SettingsIcon />,
      clinics: <HospitalIcon />,
      news: <ArticleIcon />,
      blog: <ArticleIcon />,
      testimonials: <StarIcon />,
      faqs: <QuestionIcon />,
      contact_messages: <ContactIcon />,
      page_content: <DescriptionIcon />,
      landing_sections: <HomeIcon />,
      hero_slides: <StarIcon />,
      services: <HealingIcon />,
      team_members: <PersonIcon />,
      about_content: <DescriptionIcon />,
      contact_info: <ContactIcon />
    };
    
    return iconMap[collectionName] || <FolderIcon />;
  };

  const getCollectionColor = (collectionName: string): string => {
    const colors: { [key: string]: string } = {
      'users': '#1976d2',
      'patients': '#2e7d32',
      'treatments': '#ed6c02',
      'medications': '#9c27b0',
      'emotions': '#f57c00',
      'appointments': '#0288d1',
      'doctors': '#d32f2f',
      'analytics': '#7b1fa2',
      'settings': '#616161',
      'default': '#757575'
    };
    
    return colors[collectionName] || colors.default;
  };

  const renderDocumentPreview = (document: any) => {
    const { id, ...data } = document;
    
    // Special handling for patient documents
    if (data.profile && data.medicalHistory) {
      return (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            ID: {id}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {data.profile.firstName} {data.profile.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              MRN: {data.mrn || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {data.profile.email}
            </Typography>
            {data.headacheProfile && (
              <Typography variant="caption" color="text.secondary" display="block">
                Headache: {data.headacheProfile.frequency} • Severity: {data.headacheProfile.severity}/10
              </Typography>
            )}
            {data.isActive !== undefined && (
              <Chip 
                label={data.isActive ? 'Active' : 'Inactive'} 
                size="small" 
                color={data.isActive ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Box>
      );
    }
    
    // Special handling for treatment documents
    if (data.name && data.type) {
      return (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            ID: {id}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {data.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Type: {data.type}
            </Typography>
            {data.description && (
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {data.description}
              </Typography>
            )}
          </Box>
        </Box>
      );
    }
    
    // Special handling for appointment documents
    if (data.patientName && data.appointmentDate) {
      return (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            ID: {id}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {data.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Date: {new Date(data.appointmentDate).toLocaleDateString()}
            </Typography>
            {data.status && (
              <Chip 
                label={data.status} 
                size="small" 
                color={data.status === 'confirmed' ? 'success' : data.status === 'pending' ? 'warning' : 'default'}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Box>
      );
    }
    
    // Default preview for other document types
    const previewItems = Object.entries(data).slice(0, 3).map(([key, value]) => {
      return (
        <Box key={key} sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {formatFieldName(key)}:
          </Typography>
          <Typography variant="body2" sx={{ ml: 1 }}>
            {formatFieldValue(key, value)}
          </Typography>
        </Box>
      );
    });

    return (
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Document ID: {id}
        </Typography>
        {previewItems}
      </Box>
    );
  };

  const renderDocumentModal = () => {
    if (!selectedDocument || !selectedDocument.data) return null;

    const { id, ...data } = selectedDocument.data;
    
    return (
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DocumentScannerIcon color="primary" />
            <Typography variant="h6">
              {isEditing ? `Edit ${getAssetTypeName(selectedCollection)}` : `${getAssetTypeName(selectedCollection)} Details`}
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {getAssetTypeName(selectedCollection)} ID: {id}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
          
          <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            {isEditing && editingDocument ? (
              // Edit mode - show editable fields
              Object.entries(editingDocument.data).filter(([key]) => key !== 'id').map(([key, value]) => 
                renderEditableField(key, value)
              )
            ) : (
              // View mode - show formatted fields
              Object.entries(data).map(([key, value]) => 
                renderField(key, value)
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {!isEditing ? (
            // View mode actions
            <>
              <Button 
                onClick={() => handleEditDocument(selectedDocument)}
                startIcon={<EditIcon />}
                variant="outlined"
              >
                Edit
              </Button>
              <Button 
                onClick={() => handleDeleteDocument(selectedDocument, selectedCollection)}
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
              >
                Delete
              </Button>
              <Button onClick={handleCloseModal}>Close</Button>
            </>
          ) : (
            // Edit mode actions
            <>
              <Button 
                onClick={() => setIsEditing(false)}
                startIcon={<CancelIcon />}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveDocument}
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  const renderEditableField = (key: string, value: any, depth: number = 0) => {
    const indent = depth * 2;
    
    if (value === null || value === undefined) {
      return (
        <Box key={key} sx={{ ml: indent, mb: 2 }}>
          <FormControl fullWidth size="small">
            <TextField
              label={formatFieldName(key)}
              value=""
              placeholder="null"
              onChange={(e) => handleFieldChange(key, null)}
              size="small"
            />
          </FormControl>
        </Box>
      );
    }
    
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at') || key.toLowerCase().includes('time')) {
        return (
          <Box key={key} sx={{ ml: indent, mb: 2 }}>
            <TextField
              label={formatFieldName(key)}
              type="datetime-local"
              value={value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );
      }
      
      return (
        <Box key={key} sx={{ ml: indent, mb: 2 }}>
          <TextField
            label={formatFieldName(key)}
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            fullWidth
            size="small"
          />
        </Box>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <Box key={key} sx={{ ml: indent, mb: 2 }}>
          <TextField
            label={formatFieldName(key)}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(key, Number(e.target.value))}
            fullWidth
            size="small"
          />
        </Box>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <Box key={key} sx={{ ml: indent, mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={value}
                onChange={(e) => handleFieldChange(key, e.target.checked)}
              />
            }
            label={formatFieldName(key)}
          />
        </Box>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <Box key={key} sx={{ ml: indent, mb: 2 }}>
          <TextField
            label={`${formatFieldName(key)} (JSON array)`}
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(key, parsed);
              } catch (error) {
                // Invalid JSON, keep as string
                handleFieldChange(key, e.target.value);
              }
            }}
            fullWidth
            size="small"
            multiline
            rows={2}
            helperText="Enter as JSON array"
          />
        </Box>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <Box key={key} sx={{ ml: indent, mb: 2 }}>
          <TextField
            label={`${formatFieldName(key)} (JSON object)`}
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(key, parsed);
              } catch (error) {
                // Invalid JSON, keep as string
                handleFieldChange(key, e.target.value);
              }
            }}
            fullWidth
            size="small"
            multiline
            rows={3}
            helperText="Enter as JSON object"
          />
        </Box>
      );
    }
    
    return null;
  };

  const renderNewDocumentForm = () => {
    return (
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            <Typography variant="h6">Add New {getAssetTypeName(selectedCollection)} to {getCollectionDisplayName(selectedCollection)}</Typography>
            <IconButton
              onClick={() => setOpenAddModal(false)}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Collection: {getCollectionDisplayName(selectedCollection)}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
          
          <Stack spacing={2}>
            {Object.entries(newDocument).map(([key, value]) => {
              const fieldType = getFieldType(key, value);
              const options = getFieldOptions(key);
              
              return (
                <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label="Field Name"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const updatedDoc = { ...newDocument };
                      delete updatedDoc[key];
                      updatedDoc[newKey] = value;
                      setNewDocument(updatedDoc);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  
                  {/* Render different input types based on field type */}
                  {fieldType === 'boolean' ? (
                    <FormControl size="small" sx={{ flex: 2 }}>
                      <InputLabel>Value</InputLabel>
                      <Select
                        value={String(value)}
                        onChange={(e) => handleNewFieldChange(key, e.target.value === 'true')}
                        label="Value"
                      >
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                      </Select>
                    </FormControl>
                  ) : fieldType === 'select' && options.length > 0 ? (
                    <FormControl size="small" sx={{ flex: 2 }}>
                      <InputLabel>Value</InputLabel>
                      <Select
                        value={String(value)}
                        onChange={(e) => handleNewFieldChange(key, e.target.value)}
                        label="Value"
                      >
                        {options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : fieldType === 'date' ? (
                    <TextField
                      label="Field Value"
                      type="date"
                      value={value && typeof value === 'string' && !isNaN(Date.parse(value)) ? new Date(value).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleNewFieldChange(key, e.target.value)}
                      size="small"
                      sx={{ flex: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : fieldType === 'number' ? (
                    <TextField
                      label="Field Value"
                      type="number"
                      value={String(value)}
                      onChange={(e) => handleNewFieldChange(key, Number(e.target.value))}
                      size="small"
                      sx={{ flex: 2 }}
                    />
                  ) : (
                    <TextField
                      label="Field Value"
                      value={String(value)}
                      onChange={(e) => handleNewFieldChange(key, e.target.value)}
                      size="small"
                      sx={{ flex: 2 }}
                      multiline={fieldType === 'text' && (key.includes('description') || key.includes('notes'))}
                      rows={fieldType === 'text' && (key.includes('description') || key.includes('notes')) ? 2 : 1}
                    />
                  )}
                  
                  <IconButton 
                    onClick={() => removeField(key)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              );
            })}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addNewField}
              variant="outlined"
              size="small"
            >
              Add Field
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button 
            onClick={handleAddDocument}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={Object.keys(newDocument).length === 0}
          >
            Add Document
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderField = (key: string, value: any, depth: number = 0) => {
    const indent = depth * 2;
    
    if (value === null || value === undefined) {
      return (
        <Box key={key} sx={{ ml: indent, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{formatFieldName(key)}:</strong> <em>null</em>
          </Typography>
        </Box>
      );
    }
    
    if (typeof value === 'string') {
      // Check if it's a date string
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at') || key.toLowerCase().includes('time')) {
        const formattedDate = formatDate(value);
        return (
          <Box key={key} sx={{ ml: indent, mb: 1 }}>
            <Typography variant="body2">
              <strong>{formatFieldName(key)}:</strong> {formattedDate}
            </Typography>
          </Box>
        );
      }
      
      return (
        <Box key={key} sx={{ ml: indent, mb: 1 }}>
          <Typography variant="body2">
            <strong>{formatFieldName(key)}:</strong> {value}
          </Typography>
        </Box>
      );
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <Box key={key} sx={{ ml: indent, mb: 1 }}>
          <Typography variant="body2">
            <strong>{formatFieldName(key)}:</strong> {formatFieldValue(key, value)}
          </Typography>
        </Box>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <Box key={key} sx={{ ml: indent, mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatFieldName(key)} ({value.length} items):
          </Typography>
          {value.slice(0, 5).map((item, index) => (
            <Box key={index} sx={{ ml: 2, mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                [{index}]: {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </Typography>
            </Box>
          ))}
          {value.length > 5 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              ... and {value.length - 5} more items
            </Typography>
          )}
        </Box>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <Box key={key} sx={{ ml: indent, mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatFieldName(key)}:
          </Typography>
          {Object.entries(value).map(([subKey, subValue]) => 
            renderField(subKey, subValue, depth + 1)
          )}
        </Box>
      );
    }
    
    return null;
  };

  const getFieldType = (fieldName: string, value: any): string => {
    // Determine field type based on field name and value
    if (fieldName.includes('date') || fieldName.includes('Date')) return 'date';
    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('phone')) return 'tel';
    if (fieldName.includes('url')) return 'url';
    if (fieldName.includes('number') || fieldName.includes('age') || fieldName.includes('dosage')) return 'number';
    if (fieldName.includes('isActive') || fieldName.includes('active')) return 'boolean';
    if (fieldName.includes('gender')) return 'select';
    if (fieldName.includes('route')) return 'select';
    if (fieldName.includes('intensity')) return 'select';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'text';
  };

  const getFieldOptions = (fieldName: string): string[] => {
    const options: { [key: string]: string[] } = {
      'gender': ['Male', 'Female', 'Other', 'Prefer not to say'],
      'route': ['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Inhalation'],
      'intensity': ['Low', 'Moderate', 'High', 'Severe'],
      'frequency': ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly', 'Monthly']
    };
    
    return options[fieldName] || [];
  };

  const validateMedicalField = (fieldName: string, value: any): string | null => {
    // Medical field validation rules
    const validations: { [key: string]: (value: any) => string | null } = {
      'email': (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Please enter a valid email address';
      },
      'phone': (value) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : 'Please enter a valid phone number';
      },
      'dosage': (value) => {
        const dosageRegex = /^\d+(\.\d+)?\s*(mg|g|mcg|ml|units)$/i;
        return dosageRegex.test(value) ? null : 'Please enter dosage in format: 400mg, 0.5g, etc.';
      },
      'age': (value) => {
        const age = Number(value);
        return age >= 0 && age <= 150 ? null : 'Age must be between 0 and 150';
      },
      'dateOfBirth': (value) => {
        const date = new Date(value);
        const now = new Date();
        return date < now ? null : 'Date of birth cannot be in the future';
      }
    };
    
    const validator = validations[fieldName];
    return validator ? validator(value) : null;
  };

  const handlePopulateSampleData = async (collectionName: string) => {
    if (!window.confirm(`Are you sure you want to populate sample data for ${getCollectionDisplayName(collectionName)}? This will add ${populateSampleData(collectionName).length} sample documents.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sampleDocs = populateSampleData(collectionName);
      const collectionRef = collection(db, collectionName);

      for (const docData of sampleDocs) {
        await addDoc(collectionRef, docData);
      }

      setSnackbar({
        open: true,
        message: `${getCollectionDisplayName(collectionName)} populated with ${sampleDocs.length} sample documents!`,
        severity: 'success'
      });

      // Refresh the data
      exploreDatabase();
    } catch (error) {
      console.error('Error populating sample data:', error);
      setSnackbar({
        open: true,
        message: `Failed to populate sample data for ${getCollectionDisplayName(collectionName)}. Please try again.`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Exploring Database...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={exploreDatabase} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No collections found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No accessible collections were found in your Firestore database.
        </Typography>
        <Button onClick={exploreDatabase} variant="contained">
          Refresh Collections
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DatabaseIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Database Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your Firestore collections and {getAssetTypeName(collections[0]?.name || 'records')}s
          </Typography>
        </Box>
      </Box>

      {/* Emotions and Headache Regions Management */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon color="primary" />
          Emotions & Headache Regions Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage emotions and headache regions that users can select from in the app. These options will be available for both patients and doctors to use.
        </Typography>
        <EmotionsHeadacheManager />
      </Box>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DatabaseIcon color="primary" />
              <Typography variant="h5">Firestore Database Explorer</Typography>
            </Box>
          }
          subheader={`Found ${collections.length} collections with data`}
          action={
            <Button
              startIcon={<RefreshIcon />}
              onClick={exploreDatabase}
              variant="outlined"
              size="small"
            >
              Refresh
            </Button>
          }
        />
        <CardContent>
          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />
          </Box>

          {/* Collections Grid */}
          {filteredCollections.length === 0 ? (
            <Alert severity="info">
              No collections found matching "{searchTerm}"
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {collections && collections.length > 0 ? collections.map((collection) => {
                          // Ensure collection.sampleDocuments exists
        if (!collection.sampleDocuments) {
                    console.warn(`Collection ${collection.name} has no documents array:`, collection);
                    return null;
                  }
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={collection.name}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderTop: `4px solid ${getCollectionColor(collection.name)}`,
                          '&:hover': {
                            elevation: 4,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        {/* Collection Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: `${getCollectionColor(collection.name)}20`,
                              color: getCollectionColor(collection.name)
                            }}
                          >
                            {getCollectionIcon(collection.name)}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {getCollectionDisplayName(collection.name)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {collection.sampleDocuments?.length || 0} {getAssetTypeName(collection.name)}{(collection.sampleDocuments?.length || 0) !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Sample Documents */}
                        {collection.sampleDocuments && collection.sampleDocuments.length > 0 && (
                          <Collapse in={expandedCollections.has(collection.name)}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Recent {getAssetTypeName(collection.name)}s:
                              </Typography>
                              {collection.sampleDocuments.slice(0, 3).map((doc, index) => (
                                <Paper
                                  key={index}
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    mb: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: 'action.hover',
                                      borderColor: getCollectionColor(collection.name)
                                    }
                                  }}
                                  onClick={() => handleDocumentView(doc, collection.name)}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DescriptionIcon fontSize="small" color="action" />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography variant="body2" noWrap>
                                        {getAssetTypeName(collection.name)} #{index + 1}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {renderDocumentPreview(doc)}
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDocumentView(doc, collection.name);
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              ))}
                              {collection.sampleDocuments.length > 3 && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  ... and {collection.sampleDocuments.length - 3} more {getAssetTypeName(collection.name)}s
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        )}

                        {/* Collection Actions */}
                        <Box sx={{ mt: 'auto' }}>
                          {/* Expand/Collapse Button - Only show if there are documents */}
                          {collection.sampleDocuments && collection.sampleDocuments.length > 0 && (
                            <Button
                              fullWidth
                              variant="text"
                              size="small"
                              onClick={() => toggleCollection(collection.name)}
                              startIcon={expandedCollections.has(collection.name) ? <ExpandMoreIcon /> : <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': {
                                  backgroundColor: 'action.hover'
                                }
                              }}
                            >
                              {expandedCollections.has(collection.name) ? 'Show Less' : `Show ${getAssetTypeName(collection.name)}s`}
                            </Button>
                          )}

                          {/* Populate Sample Data Button - Only show for empty medical collections */}
                          {(!collection.sampleDocuments || collection.sampleDocuments.length === 0) && 
                           ['medications', 'treatments', 'emotions', 'patients'].includes(collection.name) && (
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handlePopulateSampleData(collection.name)}
                              sx={{ 
                                mb: 1,
                                borderColor: getCollectionColor(collection.name),
                                color: getCollectionColor(collection.name),
                                '&:hover': {
                                  borderColor: getCollectionColor(collection.name),
                                  backgroundColor: `${getCollectionColor(collection.name)}10`
                                }
                              }}
                            >
                              Populate Sample Data
                            </Button>
                          )}

                          {/* Add New Asset Button */}
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddDocumentToCollection(collection.name)}
                            sx={{ 
                              mt: collection.sampleDocuments && collection.sampleDocuments.length > 0 ? 1 : 0,
                              backgroundColor: getCollectionColor(collection.name),
                              '&:hover': {
                                backgroundColor: getCollectionColor(collection.name),
                                opacity: 0.8
                              }
                            }}
                          >
                            Add New {getAssetTypeName(collection.name)}
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                }) : (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No collections found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try refreshing the page or check your Firebase connection
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
          )}
        </CardContent>
      </Card>

      {/* Medical Collections Summary */}
      {collections.some(c => ['medications', 'treatments', 'emotions', 'patients'].includes(c.name)) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HospitalIcon color="primary" />
            Medical Collections Overview
          </Typography>
          <Grid container spacing={2}>
            {['medications', 'treatments', 'emotions', 'patients'].map(collectionName => {
              const collection = collections.find(c => c.name === collectionName);
              if (!collection) return null;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={collectionName}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: `2px solid ${getCollectionColor(collectionName)}` }}>
                    <Box sx={{ color: getCollectionColor(collectionName), mb: 1 }}>
                      {getCollectionIcon(collectionName)}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {getCollectionDisplayName(collectionName)}
                    </Typography>
                    <Typography variant="h4" sx={{ color: getCollectionColor(collectionName), fontWeight: 'bold' }}>
                      {collection.count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {collection.count === 1 ? getAssetTypeName(collectionName) : `${getAssetTypeName(collectionName)}s`}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Document Detail Modal */}
      {renderDocumentModal()}
      {renderNewDocumentForm()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
