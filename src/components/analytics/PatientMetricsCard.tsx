'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PatientMetrics {
  totalPatients: number;
  newPatientsThisMonth: number;
  activePatients: number;
  ageDistribution: Array<{ group: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  headacheTypes: Array<{ type: string; count: number; percentage: number }>;
}

interface PatientMetricsCardProps {
  metrics: PatientMetrics;
  loading?: boolean;
}

export function PatientMetricsCard({ metrics, loading = false }: PatientMetricsCardProps) {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" color="text.primary">
            {label}: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Overview Stats */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Total Patients
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {metrics.totalPatients.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      New This Month
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {metrics.newPatientsThisMonth}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Active Patients
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                      {metrics.activePatients}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                    <CalendarIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Activity Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {Math.round((metrics.activePatients / metrics.totalPatients) * 100)}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                    <HospitalIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Age Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Age Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={theme.palette.primary.main}>
                  {metrics.ageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gender Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Gender Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Headache Types */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Headache Type Distribution" />
          <CardContent>
            <Grid container spacing={2}>
              {metrics.headacheTypes.map((type, index) => (
                <Grid item xs={12} sm={4} key={type.type}>
                  <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {type.type}
                      </Typography>
                      <Chip 
                        label={`${type.percentage}%`} 
                        size="small" 
                        color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                      />
                    </Stack>
                    <Typography variant="h5" color={COLORS[index % COLORS.length]}>
                      {type.count} patients
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={type.percentage} 
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}