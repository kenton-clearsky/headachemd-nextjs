'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Mood as MoodIcon,
  Medication as MedicationIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as StableIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Computer as ComputerIcon,
  PhoneAndroid as SmartphoneIcon,
  Tablet as TabletIcon
} from '@mui/icons-material';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  eventType: 'headache_log' | 'emotion_log' | 'medication_log' | 'daily_update' | 'user_login' | 'user_logout' | 'patient_registration' | 'appointment_scheduled' | 'treatment_update' | 'pain_alert';
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  title: string;
  description: string;
  severity?: number; // 1-10 scale
  category: string;
  subcategory?: string;
  data: {
    painLevel?: number;
    emotionType?: string;
    medicationName?: string;
    dosage?: string;
    headacheType?: string;
    triggers?: string[];
    symptoms?: string[];
    location?: string;
    duration?: string;
    impact?: string;
    notes?: string;
    deviceInfo?: {
      type: 'desktop' | 'mobile' | 'tablet';
      browser: string;
      os: string;
    };
    geoLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  impact: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface TimelineData {
  events: TimelineEvent[];
  totalEvents: number;
  eventBreakdown: {
    [key: string]: number;
  };
  userActivity: {
    [key: string]: number;
  };
  severityTrends: {
    [key: string]: number[];
  };
  timeDistribution: {
    [key: string]: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`timeline-tabpanel-${index}`}
      aria-labelledby={`timeline-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function EventTimeline({ className }: { className?: string }) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeFilter, setTimeFilter] = useState<'7d' | '3d' | '24h' | '12h' | '6h'>('7d');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const theme = useTheme();

  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get data from various collections
        const [headacheLogsSnapshot, dailyUpdatesSnapshot, medicationLogsSnapshot, userSessionsSnapshot] = await Promise.all([
          getDocs(collection(db, 'headache_logs')),
          getDocs(collection(db, 'daily_updates')),
          getDocs(collection(db, 'medication_logs')),
          getDocs(collection(db, 'user_sessions'))
        ]);

        const now = new Date();
        const events: TimelineEvent[] = [];

        // Generate realistic timeline events for the last 7 days
        const mockUsers = [
          { id: 'admin1', name: 'Dr. Sarah Johnson', role: 'Admin', email: 'sarah.johnson@headachemd.com' },
          { id: 'admin2', name: 'Dr. Michael Chen', role: 'Admin', email: 'michael.chen@headachemd.com' },
          { id: 'doctor1', name: 'Dr. Emily Davis', role: 'Doctor', email: 'emily.davis@headachemd.com' },
          { id: 'doctor2', name: 'Dr. James Wilson', role: 'Doctor', email: 'james.wilson@headachemd.com' },
          { id: 'staff1', name: 'Nurse Lisa Brown', role: 'Staff', email: 'lisa.brown@headachemd.com' },
          { id: 'staff2', name: 'Receptionist Tom Smith', role: 'Staff', email: 'tom.smith@headachemd.com' }
        ];

        const patientNames = [
          'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown', 'Frank Miller',
          'Grace Taylor', 'Henry Anderson', 'Ivy Martinez', 'Jack Thompson', 'Kate Garcia', 'Liam Rodriguez'
        ];

        // Generate events for the last 7 days
        for (let day = 0; day < 7; day++) {
          const dayStart = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
          
          // Generate 3-8 events per day
          const eventsPerDay = Math.floor(Math.random() * 6) + 3;
          
          for (let i = 0; i < eventsPerDay; i++) {
            const eventTime = new Date(dayStart.getTime() + Math.random() * 24 * 60 * 60 * 1000);
            const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            const patient = patientNames[Math.floor(Math.random() * patientNames.length)];
            
            // Randomly select event type
            const eventTypes = [
              'headache_log', 'emotion_log', 'medication_log', 'daily_update', 
              'user_login', 'user_logout', 'patient_registration', 'appointment_scheduled', 
              'treatment_update', 'pain_alert'
            ];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
            
            let event: TimelineEvent;
            
            switch (eventType) {
              case 'headache_log':
                const painLevel = Math.floor(Math.random() * 10) + 1;
                const headacheTypes = ['Migraine', 'Tension', 'Cluster', 'Sinus', 'Hormonal'];
                const triggers = ['Stress', 'Lack of sleep', 'Bright lights', 'Certain foods', 'Weather changes'];
                const symptoms = ['Nausea', 'Sensitivity to light', 'Sensitivity to sound', 'Vision changes', 'Dizziness'];
                
                event = {
                  id: `headache_${day}_${i}`,
                  timestamp: eventTime,
                  eventType: 'headache_log',
                  userId: user.id,
                  userName: user.name,
                  userRole: user.role,
                  userEmail: user.email,
                  title: `Headache Log - ${patient}`,
                  description: `${patient} reported ${painLevel}/10 pain level`,
                  severity: painLevel,
                  category: 'Patient Care',
                  subcategory: 'Headache Tracking',
                  data: {
                    painLevel,
                    headacheType: headacheTypes[Math.floor(Math.random() * headacheTypes.length)],
                    triggers: triggers.slice(0, Math.floor(Math.random() * 3) + 1),
                    symptoms: symptoms.slice(0, Math.floor(Math.random() * 3) + 1),
                    duration: `${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 12) + 8} hours`,
                    impact: ['Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
                    notes: `${patient} mentioned feeling ${painLevel > 7 ? 'very distressed' : painLevel > 4 ? 'moderately uncomfortable' : 'slightly bothered'} by the headache.`
                  },
                  impact: painLevel > 7 ? 'critical' : painLevel > 5 ? 'high' : painLevel > 3 ? 'medium' : 'low',
                  tags: ['headache', 'pain', 'patient-care', 'tracking']
                };
                break;

              case 'emotion_log':
                const emotions = ['Anxious', 'Stressed', 'Depressed', 'Frustrated', 'Hopeful', 'Calm', 'Energetic', 'Tired'];
                const emotionType = emotions[Math.floor(Math.random() * emotions.length)];
                
                event = {
                  id: `emotion_${day}_${i}`,
                  timestamp: eventTime,
                  eventType: 'emotion_log',
                  userId: user.id,
                  userName: user.name,
                  userRole: user.role,
                  userEmail: user.email,
                  title: `Emotion Log - ${patient}`,
                  description: `${patient} reported feeling ${emotionType.toLowerCase()}`,
                  severity: Math.floor(Math.random() * 10) + 1,
                  category: 'Patient Care',
                  subcategory: 'Emotional Health',
                  data: {
                    emotionType,
                    notes: `${patient} expressed feeling ${emotionType.toLowerCase()} during today's session. This may be related to their headache symptoms and treatment progress.`
                  },
                  impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                  tags: ['emotion', 'mental-health', 'patient-care', 'wellness']
                };
                break;

              case 'medication_log':
                const medications = ['Ibuprofen', 'Acetaminophen', 'Sumatriptan', 'Rizatriptan', 'Propranolol', 'Amitriptyline'];
                const medicationName = medications[Math.floor(Math.random() * medications.length)];
                const dosages = ['50mg', '100mg', '200mg', '500mg', '10mg', '25mg'];
                
                event = {
                  id: `medication_${day}_${i}`,
                  timestamp: eventTime,
                  eventType: 'medication_log',
                  userId: user.id,
                  userName: user.name,
                  userRole: user.role,
                  userEmail: user.email,
                  title: `Medication Log - ${patient}`,
                  description: `${patient} took ${medicationName} ${dosages[Math.floor(Math.random() * dosages.length)]}`,
                  severity: Math.floor(Math.random() * 10) + 1,
                  category: 'Patient Care',
                  subcategory: 'Medication Tracking',
                  data: {
                    medicationName,
                    dosage: dosages[Math.floor(Math.random() * dosages.length)],
                    notes: `${patient} reported taking ${medicationName} as prescribed. No adverse effects noted.`
                  },
                  impact: 'medium',
                  tags: ['medication', 'treatment', 'patient-care', 'pharmacy']
                };
                break;

              case 'daily_update':
                event = {
                  id: `daily_${day}_${i}`,
                  timestamp: eventTime,
                  eventType: 'daily_update',
                  userId: user.id,
                  userName: user.name,
                  userRole: user.role,
                  userEmail: user.email,
                  title: `Daily Update - ${patient}`,
                  description: `${patient} completed daily health check-in`,
                  severity: Math.floor(Math.random() * 10) + 1,
                  category: 'Patient Care',
                  subcategory: 'Daily Monitoring',
                  data: {
                    notes: `${patient} completed their daily health assessment. Overall mood and energy levels are being tracked.`
                  },
                  impact: 'low',
                  tags: ['daily-update', 'monitoring', 'patient-care', 'routine']
                };
                break;

              case 'user_login':
                event = {
                  id: `login_${day}_${i}`,
                  timestamp: eventTime,
                  eventType: 'user_login',
                  userId: user.id,
                  userName: user.name,
                  userRole: user.role,
                  userEmail: user.email,
                  title: `User Login - ${user.name}`,
                  description: `${user.name} logged into the system`,
                  severity: 1,
                  category: 'System',
                  subcategory: 'Authentication',
                  data: {
                    deviceInfo: {
                      type: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
                      browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
                      os: ['Windows', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)]
                    },
                    geoLocation: {
                      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
                      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
                      country: 'USA'
                    }
                  },
                  impact: 'low',
                  tags: ['login', 'authentication', 'system', 'user-activity']
                };
                break;

              default:
                event = {
                  id: `event_${day}_${i}`,
                  timestamp: eventTime,
                  eventType: 'daily_update',
                  userId: user.id,
                  userName: user.name,
                  userRole: user.role,
                  userEmail: user.email,
                  title: `Activity - ${patient}`,
                  description: `General activity recorded for ${patient}`,
                  severity: Math.floor(Math.random() * 10) + 1,
                  category: 'Patient Care',
                  subcategory: 'General',
                  data: {
                    notes: `Standard activity tracking for ${patient}`
                  },
                  impact: 'low',
                  tags: ['activity', 'patient-care', 'tracking']
                };
            }
            
            events.push(event);
          }
        }

        // Sort events by timestamp (newest first)
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Calculate statistics
        const eventBreakdown: { [key: string]: number } = {};
        const userActivity: { [key: string]: number } = {};
        const severityTrends: { [key: string]: number[] } = {};
        const timeDistribution: { [key: string]: number } = {};

        events.forEach(event => {
          // Event type breakdown
          eventBreakdown[event.eventType] = (eventBreakdown[event.eventType] || 0) + 1;
          
          // User activity
          userActivity[event.userName] = (userActivity[event.userName] || 0) + 1;
          
          // Severity trends by day
          const dayKey = event.timestamp.toDateString();
          if (!severityTrends[dayKey]) severityTrends[dayKey] = [];
          if (event.severity) severityTrends[dayKey].push(event.severity);
          
          // Time distribution
          const hourKey = event.timestamp.getHours();
          timeDistribution[hourKey] = (timeDistribution[hourKey] || 0) + 1;
        });

        const timelineData: TimelineData = {
          events,
          totalEvents: events.length,
          eventBreakdown,
          userActivity,
          severityTrends,
          timeDistribution
        };

        setTimelineData(timelineData);
      } catch (err) {
        console.error('Failed to load timeline data:', err);
        setError('Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    loadTimelineData();

    // Refresh data every 5 minutes
    const interval = setInterval(loadTimelineData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [timeFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'headache_log':
        return <HospitalIcon sx={{ fontSize: 16 }} />;
      case 'emotion_log':
        return <MoodIcon sx={{ fontSize: 16 }} />;
      case 'medication_log':
        return <MedicationIcon sx={{ fontSize: 16 }} />;
      case 'daily_update':
        return <AssessmentIcon sx={{ fontSize: 16 }} />;
      case 'user_login':
        return <PersonIcon sx={{ fontSize: 16 }} />;
      case 'user_logout':
        return <PersonIcon sx={{ fontSize: 16 }} />;
      case 'patient_registration':
        return <PersonIcon sx={{ fontSize: 16 }} />;
      case 'appointment_scheduled':
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case 'treatment_update':
        return <HospitalIcon sx={{ fontSize: 16 }} />;
      case 'pain_alert':
        return <NotificationsIcon sx={{ fontSize: 16 }} />;
      default:
        return <EventIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'headache_log':
        return 'error';
      case 'emotion_log':
        return 'warning';
      case 'medication_log':
        return 'info';
      case 'daily_update':
        return 'success';
      case 'user_login':
        return 'primary';
      case 'user_logout':
        return 'default';
      case 'patient_registration':
        return 'secondary';
      case 'appointment_scheduled':
        return 'success';
      case 'treatment_update':
        return 'info';
      case 'pain_alert':
        return 'error';
      default:
        return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return timestamp.toLocaleDateString();
  };

  const getSeverityIcon = (severity: number) => {
    if (severity >= 8) return <TrendingUpIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    if (severity >= 6) return <TrendingUpIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
    if (severity >= 4) return <StableIcon sx={{ fontSize: 16, color: 'info.main' }} />;
    return <TrendingDownIcon sx={{ fontSize: 16, color: 'success.main' }} />;
  };

  if (loading) {
    return (
      <Box className={className} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!timelineData) {
    return (
      <Box className={className}>
        <Alert severity="info">No timeline data available</Alert>
      </Box>
    );
  }

  // Filter events based on time filter
  const getFilteredEvents = () => {
    const now = new Date();
    let cutoffTime: Date;
    
    switch (timeFilter) {
      case '6h':
        cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '12h':
        cutoffTime = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '3d':
        cutoffTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    let filtered = timelineData.events.filter(event => event.timestamp >= cutoffTime);
    
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }
    
    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <Box className={className}>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TimelineIcon color="primary" />
              <Typography variant="h6">7-Day Event Timeline</Typography>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Window</InputLabel>
                <Select
                  value={timeFilter}
                  label="Time Window"
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                >
                  <MenuItem value="6h">Last 6 Hours</MenuItem>
                  <MenuItem value="12h">Last 12 Hours</MenuItem>
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="3d">Last 3 Days</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={eventTypeFilter}
                  label="Event Type"
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Events</MenuItem>
                  <MenuItem value="headache_log">Headache Logs</MenuItem>
                  <MenuItem value="emotion_log">Emotion Logs</MenuItem>
                  <MenuItem value="medication_log">Medication Logs</MenuItem>
                  <MenuItem value="daily_update">Daily Updates</MenuItem>
                  <MenuItem value="user_login">User Logins</MenuItem>
                  <MenuItem value="user_logout">User Logouts</MenuItem>
                  <MenuItem value="patient_registration">Patient Registration</MenuItem>
                  <MenuItem value="appointment_scheduled">Appointments</MenuItem>
                  <MenuItem value="treatment_update">Treatment Updates</MenuItem>
                  <MenuItem value="pain_alert">Pain Alerts</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="Refresh Timeline">
                <IconButton onClick={() => window.location.reload()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="timeline tabs">
            <Tab label="Timeline View" />
            <Tab label="Event Summary" />
            <Tab label="User Activity" />
            <Tab label="Severity Trends" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
              <List>
                {filteredEvents.map((event, index) => (
                  <React.Fragment key={event.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: `${getEventColor(event.eventType)}.light` }}>
                          {getEventIcon(event.eventType)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            <Typography variant="body1" sx={{ fontWeight: 500, display: 'inline-block', mr: 1 }}>
                              {event.title}
                            </Typography>
                            <Chip 
                              label={event.eventType.replace('_', ' ')} 
                              size="small" 
                              color={getEventColor(event.eventType) as any} 
                              variant="outlined" 
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={event.impact} 
                              size="small" 
                              color={getImpactColor(event.impact) as any} 
                              variant="outlined" 
                              sx={{ mr: 1 }}
                            />
                            {event.severity && (
                              <>
                                {getSeverityIcon(event.severity)}
                                <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 0.5 }}>
                                  {event.severity}/10
                                </Typography>
                              </>
                            )}
                          </>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                              {event.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', mt: 1 }}>
                              👤 {event.userName} ({event.userRole}) • 🕒 {formatTimestamp(event.timestamp)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                              📍 {event.data.geoLocation?.city}, {event.data.geoLocation?.state}
                              {event.data.deviceInfo && (
                                <> • 💻 {event.data.deviceInfo.type} • {event.data.deviceInfo.browser}</>
                              )}
                            </Typography>
                            {event.data.notes && (
                              <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                📝 {event.data.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < filteredEvents.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Event Breakdown" />
                  <CardContent>
                    <Stack spacing={2}>
                      {Object.entries(timelineData.eventBreakdown)
                        .sort(([,a], [,b]) => b - a)
                        .map(([eventType, count]) => (
                          <Box key={eventType} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getEventIcon(eventType)}
                              <Typography variant="body2">
                                {eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Typography>
                            </Box>
                            <Chip label={count} size="small" color="primary" variant="outlined" />
                          </Box>
                        ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Time Distribution" />
                  <CardContent>
                    <Stack spacing={2}>
                      {Object.entries(timelineData.timeDistribution)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([hour, count]) => (
                          <Box key={hour} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                              {Number(hour) === 0 ? '12 AM' : Number(hour) === 12 ? '12 PM' : Number(hour) > 12 ? `${Number(hour) - 12} PM` : `${hour} AM`}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={(count / Math.max(...Object.values(timelineData.timeDistribution))) * 100} 
                                sx={{ width: 100, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {count}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardHeader title="User Activity Summary" />
              <CardContent>
                <Grid container spacing={2}>
                  {Object.entries(timelineData.userActivity)
                    .sort(([,a], [,b]) => b - a)
                    .map(([userName, count]) => (
                      <Grid item xs={12} sm={6} md={4} key={userName}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 1, bgcolor: 'primary.light' }}>
                            <PersonIcon />
                          </Avatar>
                          <Typography variant="h6">{userName}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {count} events
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(count / Math.max(...Object.values(timelineData.userActivity))) * 100} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardHeader title="Severity Trends by Day" />
              <CardContent>
                <Grid container spacing={2}>
                  {Object.entries(timelineData.severityTrends)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([date, severities]) => {
                      const avgSeverity = severities.length > 0 
                        ? Math.round(severities.reduce((sum, s) => sum + s, 0) / severities.length * 10) / 10
                        : 0;
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={date}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Typography>
                            <Typography variant="h4" sx={{ 
                              color: avgSeverity > 7 ? 'error.main' : 
                                     avgSeverity > 5 ? 'warning.main' : 
                                     avgSeverity > 3 ? 'info.main' : 'success.main',
                              fontWeight: 'bold'
                            }}>
                              {avgSeverity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Average Severity
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {severities.length} events
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
