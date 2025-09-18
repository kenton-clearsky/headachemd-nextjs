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
  Stack,
  useTheme,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface TreatmentData {
  treatmentType: string;
  patientCount: number;
  averagePainReduction: number;
  successRate: number;
  adherenceRate: number;
  sideEffectRate: number;
}

interface TimeSeriesData {
  date: string;
  painLevel: number;
  medicationEffectiveness: number;
  functionalImprovement: number;
}

interface TreatmentEffectivenessProps {
  treatmentData: TreatmentData[];
  timeSeriesData: TimeSeriesData[];
  loading?: boolean;
}

export function TreatmentEffectivenessChart({ 
  treatmentData, 
  timeSeriesData, 
  loading = false 
}: TreatmentEffectivenessProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedMetric, setSelectedMetric] = React.useState<'all' | 'pain' | 'effectiveness'>('all');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" fontWeight={600}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="caption" display="block" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const radarData = treatmentData.map(treatment => ({
    treatment: treatment.treatmentType,
    'Success Rate': treatment.successRate,
    'Pain Reduction': treatment.averagePainReduction,
    'Adherence': treatment.adherenceRate,
    'Low Side Effects': 100 - treatment.sideEffectRate
  }));

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
      {/* Treatment Comparison */}
      <Grid item xs={12} lg={6}>
        <Card>
          <CardHeader 
            title="Treatment Effectiveness Comparison"
            action={
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            }
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { setSelectedMetric('all'); handleMenuClose(); }}>
              All Metrics
            </MenuItem>
            <MenuItem onClick={() => { setSelectedMetric('pain'); handleMenuClose(); }}>
              Pain Reduction Only
            </MenuItem>
            <MenuItem onClick={() => { setSelectedMetric('effectiveness'); handleMenuClose(); }}>
              Effectiveness Only
            </MenuItem>
          </Menu>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={treatmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="treatmentType" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(selectedMetric === 'all' || selectedMetric === 'pain') && (
                  <Bar dataKey="averagePainReduction" fill={theme.palette.primary.main} name="Pain Reduction %" />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'effectiveness') && (
                  <Bar dataKey="successRate" fill={theme.palette.success.main} name="Success Rate %" />
                )}
                {selectedMetric === 'all' && (
                  <Bar dataKey="adherenceRate" fill={theme.palette.info.main} name="Adherence %" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Treatment Radar Chart */}
      <Grid item xs={12} lg={6}>
        <Card>
          <CardHeader title="Treatment Profile Analysis" />
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="treatment" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {radarData.map((_, index) => (
                  <Radar
                    key={index}
                    name={radarData[index].treatment}
                    dataKey={(data) => {
                      if (data.treatment === radarData[index].treatment) {
                        return (data['Success Rate'] + data['Pain Reduction'] + data['Adherence'] + data['Low Side Effects']) / 4;
                      }
                      return 0;
                    }}
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                  />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Pain Level Trends Over Time */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Treatment Outcomes Over Time" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="painLevel" 
                  stroke={theme.palette.error.main} 
                  fill={theme.palette.error.light} 
                  fillOpacity={0.3}
                  name="Pain Level"
                />
                <Area 
                  type="monotone" 
                  dataKey="medicationEffectiveness" 
                  stroke={theme.palette.success.main} 
                  fill={theme.palette.success.light}
                  fillOpacity={0.3}
                  name="Medication Effectiveness"
                />
                <Area 
                  type="monotone" 
                  dataKey="functionalImprovement" 
                  stroke={theme.palette.info.main} 
                  fill={theme.palette.info.light}
                  fillOpacity={0.3}
                  name="Functional Improvement"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Treatment Success Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {treatmentData.map((treatment, index) => (
            <Grid item xs={12} sm={6} md={4} key={treatment.treatmentType}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {treatment.treatmentType}
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {treatment.patientCount} patients
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Success Rate</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {treatment.successRate > 80 ? (
                            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography variant="body2" fontWeight={600} color={treatment.successRate > 80 ? 'success.main' : 'error.main'}>
                            {treatment.successRate}%
                          </Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={treatment.successRate} 
                        sx={{ height: 6, borderRadius: 3 }}
                        color={treatment.successRate > 80 ? 'success' : 'warning'}
                      />
                    </Box>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Pain Reduction</Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {treatment.averagePainReduction}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={treatment.averagePainReduction} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Chip 
                        label={`${treatment.adherenceRate}% adherence`} 
                        size="small" 
                        color={treatment.adherenceRate > 85 ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Chip 
                        label={`${treatment.sideEffectRate}% side effects`} 
                        size="small" 
                        color={treatment.sideEffectRate < 20 ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}