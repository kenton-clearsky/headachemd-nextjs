'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Button,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';

interface ContentStatus {
  category: string;
  items: ContentItem[];
  priority: 'high' | 'medium' | 'low';
  description: string;
}

interface ContentItem {
  name: string;
  status: 'present' | 'missing' | 'partial';
  count?: number;
  description: string;
  suggestedContent?: string;
}

export default function ContentAnalyzer() {
  const [contentStatus, setContentStatus] = useState<ContentStatus[]>([]);
  const theme = useTheme();

  useEffect(() => {
    analyzeContent();
  }, []);

  const analyzeContent = () => {
    // This would typically query the database, but for now we'll show the structure
    const analysis: ContentStatus[] = [
      {
        category: 'Landing Page Content',
        priority: 'high',
        description: 'Essential content for the main landing page',
        items: [
          {
            name: 'Hero Slider',
            status: 'present',
            count: 3,
            description: 'Main banner slides with headlines and CTAs',
            suggestedContent: '3-5 slides with compelling headlines, images, and call-to-action buttons'
          },
          {
            name: 'About Section',
            status: 'present',
            count: 1,
            description: 'Company overview and mission statement',
            suggestedContent: 'Detailed company story, mission, vision, and key achievements'
          },
          {
            name: 'Services',
            status: 'present',
            count: 6,
            description: 'Medical services and treatments offered',
            suggestedContent: 'Comprehensive list of treatments with descriptions, benefits, and pricing'
          },
          {
            name: 'Team Members',
            status: 'present',
            count: 4,
            description: 'Doctor profiles and credentials',
            suggestedContent: 'Professional photos, bios, specialties, education, and experience'
          },
          {
            name: 'Testimonials',
            status: 'missing',
            description: 'Patient success stories and reviews',
            suggestedContent: '10-15 patient testimonials with photos, stories, and ratings'
          },
          {
            name: 'FAQ Section',
            status: 'missing',
            description: 'Common questions and answers',
            suggestedContent: '20-30 frequently asked questions about treatments, insurance, and procedures'
          }
        ]
      },
      {
        category: 'Patient Management',
        priority: 'high',
        description: 'Core patient data and management features',
        items: [
          {
            name: 'Patient Records',
            status: 'present',
            count: 100,
            description: 'Patient medical records and history',
            suggestedContent: 'Complete patient profiles with medical history, treatments, and progress notes'
          },
          {
            name: 'Appointments',
            status: 'missing',
            description: 'Scheduling and appointment management',
            suggestedContent: 'Appointment booking system with calendar integration and reminders'
          },
          {
            name: 'Treatment Plans',
            status: 'missing',
            description: 'Individualized treatment protocols',
            suggestedContent: 'Customized treatment plans with goals, timelines, and progress tracking'
          },
          {
            name: 'Medical History',
            status: 'partial',
            count: 50,
            description: 'Patient medical background',
            suggestedContent: 'Comprehensive medical history including diagnoses, medications, and allergies'
          }
        ]
      },
      {
        category: 'Medical Content',
        priority: 'medium',
        description: 'Educational and informational medical content',
        items: [
          {
            name: 'Blog Articles',
            status: 'missing',
            description: 'Medical education and news',
            suggestedContent: 'Weekly blog posts about headache treatments, medical research, and wellness tips'
          },
          {
            name: 'Treatment Guides',
            status: 'missing',
            description: 'Detailed treatment information',
            suggestedContent: 'Comprehensive guides for each treatment option with procedures and expectations'
          },
          {
            name: 'Research Papers',
            status: 'missing',
            description: 'Medical research and studies',
            suggestedContent: 'Published research papers and clinical studies related to headache treatment'
          },
          {
            name: 'Educational Videos',
            status: 'missing',
            description: 'Video content for patient education',
            suggestedContent: 'Short educational videos explaining treatments, procedures, and prevention tips'
          }
        ]
      },
      {
        category: 'Business Operations',
        priority: 'medium',
        description: 'Operational and administrative content',
        items: [
          {
            name: 'Clinic Information',
            status: 'missing',
            description: 'Location and contact details',
            suggestedContent: 'Complete clinic information including addresses, phone numbers, hours, and directions'
          },
          {
            name: 'Insurance Information',
            status: 'missing',
            description: 'Accepted insurance plans and coverage',
            suggestedContent: 'List of accepted insurance providers, coverage details, and payment options'
          },
          {
            name: 'Pricing Information',
            status: 'missing',
            description: 'Treatment costs and payment options',
            suggestedContent: 'Transparent pricing for all services with payment plans and financing options'
          },
          {
            name: 'Contact Forms',
            status: 'missing',
            description: 'Patient inquiry and contact forms',
            suggestedContent: 'Multiple contact forms for appointments, general inquiries, and emergency contacts'
          }
        ]
      }
    ];

    setContentStatus(analysis);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon color="success" />;
      case 'partial':
        return <WarningIcon color="warning" />;
      case 'missing':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'partial':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              <Typography variant="h5">Content Analysis & Recommendations</Typography>
            </Box>
          }
          subheader="Analyze your content and identify what's missing"
        />
        <CardContent>
          <Grid container spacing={3}>
            {contentStatus.map((category) => (
              <Grid item xs={12} md={6} key={category.category}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {category.category}
                    </Typography>
                    <Chip 
                      label={category.priority.toUpperCase()} 
                      color={getPriorityColor(category.priority) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {category.description}
                  </Typography>

                  <List dense>
                    {category.items.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.name}
                              </Typography>
                              {item.count && (
                                <Chip 
                                  label={item.count} 
                                  size="small" 
                                  variant="outlined"
                                  color={getStatusColor(item.status) as any}
                                />
                              )}
                            </Box>
                          }
                        />
                        
                        {/* Separate secondary content to avoid HTML nesting issues */}
                        <Box sx={{ ml: 4, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.description}
                          </Typography>
                          {item.status === 'missing' && item.suggestedContent && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                                Suggested: {item.suggestedContent}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Summary */}
          <Box sx={{ mt: 4 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Content Summary:
              </Typography>
              <Typography variant="body2">
                Based on this analysis, you have <strong>good foundational content</strong> for your landing page, 
                but could benefit from adding <strong>patient testimonials, educational content, and operational information</strong> 
                to provide a more comprehensive user experience.
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
