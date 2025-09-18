'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  LocalHospital,
  Person,
  Assessment,
  Notifications,
  Security,
  HealthAndSafety,
  MedicalServices,
  Analytics,
} from '@mui/icons-material';
import { config } from '@/lib/config';

export default function MuiDemo() {
  const [patientName, setPatientName] = useState('');
  const [severity, setSeverity] = useState('');
  const [hipaaCompliant, setHipaaCompliant] = useState(true);

  const recentPatients = [
    { id: 1, name: 'John D.', condition: 'Migraine', severity: 'Moderate' },
    { id: 2, name: 'Sarah M.', condition: 'Tension Headache', severity: 'Mild' },
    { id: 3, name: 'Robert K.', condition: 'Cluster Headache', severity: 'Severe' },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
            <LocalHospital />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {config.app.name} Dashboard
            </Typography>
            <Typography variant="subtitle1" color="rgba(255,255,255,0.8)">
              HIPAA-Compliant Medical Platform with Material-UI
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* HIPAA Compliance Alert */}
      <Alert 
        severity="success" 
        icon={<Security />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          <strong>HIPAA Compliant:</strong> All patient data is encrypted and audit-logged. 
          Session timeout: 15 minutes.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Patient Registration Form */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader 
              title="Patient Registration"
              avatar={<Person color="primary" />}
              sx={{ bgcolor: 'primary.main', color: 'white' }}
              titleTypographyProps={{ color: 'white' }}
            />
            <CardContent>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  variant="outlined"
                  helperText="Enter patient's full name (HIPAA protected)"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Headache Severity</InputLabel>
                  <Select
                    value={severity}
                    label="Headache Severity"
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    <MenuItem value="mild">Mild (1-3)</MenuItem>
                    <MenuItem value="moderate">Moderate (4-6)</MenuItem>
                    <MenuItem value="severe">Severe (7-10)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={hipaaCompliant}
                      onChange={(e) => setHipaaCompliant(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="HIPAA Compliance Verified"
                />

                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<MedicalServices />}
                  sx={{ mt: 2 }}
                >
                  Register Patient
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Dashboard */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader 
              title="Analytics Overview"
              avatar={<Assessment color="secondary" />}
              sx={{ bgcolor: 'secondary.main', color: 'white' }}
              titleTypographyProps={{ color: 'white' }}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Patient Recovery Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="caption" color="text.secondary">
                  85% improvement rate
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Treatment Effectiveness
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={92} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="primary"
                />
                <Typography variant="caption" color="text.secondary">
                  92% patient satisfaction
                </Typography>
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  icon={<HealthAndSafety />} 
                  label="HIPAA Compliant" 
                  color="success" 
                  variant="outlined"
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Real-time Analytics" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  icon={<Notifications />} 
                  label="Mobile Ready" 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Patients */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader 
              title="Recent Patients"
              avatar={<Person color="info" />}
            />
            <CardContent sx={{ pt: 0 }}>
              <List>
                {recentPatients.map((patient, index) => (
                  <React.Fragment key={patient.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {patient.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={patient.name}
                        secondary={`${patient.condition} - ${patient.severity}`}
                      />
                      <Chip 
                        label={patient.severity}
                        size="small"
                        color={
                          patient.severity === 'Severe' ? 'error' :
                          patient.severity === 'Moderate' ? 'warning' : 'success'
                        }
                      />
                    </ListItem>
                    {index < recentPatients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="contained" size="large" startIcon={<MedicalServices />}>
          New Consultation
        </Button>
        <Button variant="outlined" size="large" startIcon={<Assessment />}>
          View Reports
        </Button>
        <Button variant="outlined" size="large" startIcon={<Security />}>
          Audit Logs
        </Button>
      </Box>
    </Box>
  );
}
