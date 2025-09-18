'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
  useTheme,
  Paper,
  Avatar
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as TimeIcon,
  Thunderstorm as TriggerIcon,
  LocalPharmacy as MedicationIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';

interface HeadacheFrequencyData {
  date: string;
  frequency: number;
  intensity: number;
  triggers: string[];
}

interface TriggerAnalysis {
  trigger: string;
  occurrences: number;
  averageIntensity: number;
  patientCount: number;
}

interface TimePatternData {
  hour: number;
  frequency: number;
  day: string;
}

interface HeadachePatternProps {
  frequencyData: HeadacheFrequencyData[];
  triggerData: TriggerAnalysis[];
  timePatternData: TimePatternData[];
  loading?: boolean;
}

export function HeadachePatternChart({
  frequencyData,
  triggerData,
  timePatternData,
  loading = false
}: HeadachePatternProps) {
  const theme = useTheme();
  const [view, setView] = useState<'monthly' | 'weekly' | 'daily'>('weekly');
  const [chartType, setChartType] = useState<'frequency' | 'intensity' | 'triggers'>('frequency');

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'monthly' | 'weekly' | 'daily' | null) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleChartTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'frequency' | 'intensity' | 'triggers' | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" fontWeight={600}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index}>
              <Typography variant="caption" display="block" sx={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Process time pattern data for heatmap
  const heatmapData = timePatternData.map(item => ({
    x: item.hour,
    y: item.day,
    value: item.frequency
  }));

  // Get top triggers
  const topTriggers = triggerData
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            Loading analytics data...
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Controls */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                size="small"
              >
                <ToggleButton value="frequency">Frequency</ToggleButton>
                <ToggleButton value="intensity">Intensity</ToggleButton>
                <ToggleButton value="triggers">Triggers</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Main Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardHeader 
            title={`Headache ${chartType === 'frequency' ? 'Frequency' : chartType === 'intensity' ? 'Intensity' : 'Trigger'} Patterns`}
            subheader={`Showing ${view} view`}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'triggers' ? (
                <BarChart data={topTriggers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="trigger" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="occurrences" fill={theme.palette.primary.main} name="Occurrences" />
                  <Bar dataKey="averageIntensity" fill={theme.palette.error.main} name="Avg Intensity" />
                </BarChart>
              ) : (
                <LineChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {chartType === 'frequency' && (
                    <Line 
                      type="monotone" 
                      dataKey="frequency" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Headache Frequency"
                    />
                  )}
                  {chartType === 'intensity' && (
                    <Line 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke={theme.palette.error.main} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Pain Intensity"
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12} lg={4}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="overline">
                    Average Frequency
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {(frequencyData.reduce((sum, d) => sum + d.frequency, 0) / frequencyData.length).toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    headaches per {view}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <CalendarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="overline">
                    Average Intensity
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {(frequencyData.reduce((sum, d) => sum + d.intensity, 0) / frequencyData.length).toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    on pain scale (1-10)
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <TimeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Common Triggers
              </Typography>
              <Stack spacing={1}>
                {topTriggers.slice(0, 3).map((trigger, index) => (
                  <Box key={trigger.trigger} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip 
                      label={trigger.trigger}
                      size="small"
                      icon={<TriggerIcon />}
                      color={index === 0 ? 'primary' : 'default'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {trigger.occurrences} cases
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      {/* Time Pattern Heatmap */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Headache Time Patterns"
            subheader="When headaches occur most frequently"
          />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Grid container spacing={0.5}>
                {/* Hour labels */}
                <Grid item xs={1}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <Typography key={day} variant="caption" sx={{ height: 30, display: 'flex', alignItems: 'center' }}>
                        {day}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
                
                {/* Heatmap grid */}
                <Grid item xs={11}>
                  <Box>
                    {/* Time labels */}
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      {Array.from({ length: 24 }, (_, i) => (
                        <Typography 
                          key={i} 
                          variant="caption" 
                          sx={{ flex: 1, textAlign: 'center', fontSize: '0.65rem' }}
                        >
                          {i}
                        </Typography>
                      ))}
                    </Box>
                    
                    {/* Heatmap cells */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <Box key={day} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                        {Array.from({ length: 24 }, (_, hour) => {
                          const dataPoint = timePatternData.find(d => d.day === day && d.hour === hour);
                          const frequency = dataPoint?.frequency || 0;
                          const maxFrequency = Math.max(...timePatternData.map(d => d.frequency));
                          const opacity = frequency / maxFrequency;
                          
                          return (
                            <Paper
                              key={hour}
                              sx={{
                                flex: 1,
                                height: 30,
                                backgroundColor: theme.palette.error.main,
                                opacity: opacity * 0.8 + 0.1,
                                borderRadius: 0.5,
                                cursor: 'pointer',
                                '&:hover': {
                                  border: `1px solid ${theme.palette.primary.main}`
                                }
                              }}
                              title={`${day} ${hour}:00 - ${frequency} headaches`}
                            />
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
              
              {/* Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
                <Typography variant="caption" color="text.secondary">Less frequent</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0.2, 0.4, 0.6, 0.8, 1].map(opacity => (
                    <Box
                      key={opacity}
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: theme.palette.error.main,
                        opacity: opacity,
                        borderRadius: 0.5
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">More frequent</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}