'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Stack,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ButtonGroup,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  ShowChart as ChartIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';

interface PainTrendData {
  date: string;
  averagePain: number;
  maxPain: number;
  minPain: number;
  medicationTaken: boolean;
  patientCount: number;
}

interface PatientPainData {
  patientId: string;
  patientName: string;
  painTrend: Array<{ date: string; painLevel: number }>;
  averagePain: number;
  improvement: number;
}

interface PainLevelTrendProps {
  aggregatedData: PainTrendData[];
  patientData: PatientPainData[];
  loading?: boolean;
}

export function PainLevelTrendChart({
  aggregatedData,
  patientData,
  loading = false
}: PainLevelTrendProps) {
  const theme = useTheme();
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showComparison, setShowComparison] = useState(false);

  const handlePatientChange = (event: any) => {
    setSelectedPatient(event.target.value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight={600}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index}>
              <Typography variant="caption" display="block" sx={{ color: entry.color }}>
                {entry.name}: {entry.value}
                {entry.dataKey === 'averagePain' && ' / 10'}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Calculate overall statistics
  const avgPainLevel = aggregatedData.reduce((sum, d) => sum + d.averagePain, 0) / aggregatedData.length;
  const trendDirection = aggregatedData[aggregatedData.length - 1]?.averagePain < aggregatedData[0]?.averagePain;
  const improvementRate = ((aggregatedData[0]?.averagePain - aggregatedData[aggregatedData.length - 1]?.averagePain) / aggregatedData[0]?.averagePain * 100) || 0;

  // Get top improving patients
  const topImproving = patientData
    .filter(p => p.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            Loading pain level trends...
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Summary Stats */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Average Pain Level
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {avgPainLevel.toFixed(1)}/10
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                      {trendDirection ? (
                        <>
                          <TrendingDownIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="success.main">
                            Improving
                          </Typography>
                        </>
                      ) : (
                        <>
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          <Typography variant="caption" color="error.main">
                            Worsening
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: trendDirection ? 'success.light' : 'error.light' }}>
                    <ChartIcon />
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
                      Improvement Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: improvementRate > 0 ? 'success.main' : 'error.main' }}>
                      {Math.abs(improvementRate).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Over {timeRange} period
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <TimelineIcon />
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
                      Patients Tracked
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {patientData.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active monitoring
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <PersonIcon />
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
                      Data Points
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {aggregatedData.length * patientData.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      In selected range
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <DateRangeIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Main Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardHeader 
            title="Pain Level Trends"
            action={
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={selectedPatient}
                    onChange={handlePatientChange}
                    label="Patient"
                  >
                    <MenuItem value="all">All Patients</MenuItem>
                    {patientData.map(patient => (
                      <MenuItem key={patient.patientId} value={patient.patientId}>
                        {patient.patientName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <ButtonGroup size="small">
                  <Button 
                    variant={timeRange === '7d' ? 'contained' : 'outlined'}
                    onClick={() => setTimeRange('7d')}
                  >
                    7D
                  </Button>
                  <Button 
                    variant={timeRange === '30d' ? 'contained' : 'outlined'}
                    onClick={() => setTimeRange('30d')}
                  >
                    30D
                  </Button>
                  <Button 
                    variant={timeRange === '90d' ? 'contained' : 'outlined'}
                    onClick={() => setTimeRange('90d')}
                  >
                    90D
                  </Button>
                  <Button 
                    variant={timeRange === '1y' ? 'contained' : 'outlined'}
                    onClick={() => setTimeRange('1y')}
                  >
                    1Y
                  </Button>
                </ButtonGroup>
              </Stack>
            }
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Reference lines for pain levels */}
                <ReferenceLine y={3} stroke={theme.palette.success.main} strokeDasharray="3 3" label="Mild" />
                <ReferenceLine y={7} stroke={theme.palette.warning.main} strokeDasharray="3 3" label="Moderate" />
                <ReferenceLine y={9} stroke={theme.palette.error.main} strokeDasharray="3 3" label="Severe" />
                
                {/* Pain level area with range */}
                <Area
                  type="monotone"
                  dataKey="maxPain"
                  stroke="none"
                  fill={theme.palette.error.light}
                  fillOpacity={0.2}
                  name="Max Pain"
                />
                <Area
                  type="monotone"
                  dataKey="minPain"
                  stroke="none"
                  fill={theme.palette.background.default}
                  fillOpacity={1}
                  name="Min Pain"
                />
                
                {/* Average pain line */}
                <Line
                  type="monotone"
                  dataKey="averagePain"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Average Pain"
                />
                
                {/* Medication indicators */}
                <Bar
                  dataKey="medicationTaken"
                  fill={theme.palette.info.main}
                  opacity={0.3}
                  name="Medication Day"
                  yAxisId="right"
                />
                
                {/* Brush for zooming */}
                <Brush dataKey="date" height={30} stroke={theme.palette.primary.main} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Improving Patients */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardHeader title="Top Improving Patients" />
          <CardContent>
            <Stack spacing={2}>
              {topImproving.map((patient, index) => (
                <Paper key={patient.patientId} sx={{ p: 2 }} variant="outlined">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">
                        {patient.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Average pain: {patient.averagePain.toFixed(1)}/10
                      </Typography>
                    </Box>
                    <Chip
                      label={`${patient.improvement.toFixed(0)}% ↓`}
                      color="success"
                      size="small"
                      icon={<TrendingDownIcon />}
                    />
                  </Stack>
                  
                  {/* Mini sparkline chart */}
                  <Box sx={{ mt: 1, height: 50 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patient.painTrend.slice(-7)}>
                        <Line
                          type="monotone"
                          dataKey="painLevel"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Pain Distribution */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Pain Level Distribution Over Time"
            subheader="Percentage of patients in each pain category"
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Area
                  type="monotone"
                  dataKey="minPain"
                  stackId="1"
                  stroke={theme.palette.success.main}
                  fill={theme.palette.success.light}
                  name="Mild (1-3)"
                />
                <Area
                  type="monotone"
                  dataKey="averagePain"
                  stackId="1"
                  stroke={theme.palette.warning.main}
                  fill={theme.palette.warning.light}
                  name="Moderate (4-6)"
                />
                <Area
                  type="monotone"
                  dataKey="maxPain"
                  stackId="1"
                  stroke={theme.palette.error.main}
                  fill={theme.palette.error.light}
                  name="Severe (7-10)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}