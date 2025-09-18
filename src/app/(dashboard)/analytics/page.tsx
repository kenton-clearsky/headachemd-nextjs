'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import type { AnalyticsDashboard, AnalyticsFilter } from '@/types/analytics';
import { TimePeriod } from '@/types/analytics';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimePeriod>(TimePeriod.MONTH);
  const [filters, setFilters] = useState<AnalyticsFilter>({
    timeRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      period: TimePeriod.MONTH
    }
  });

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'doctor') {
      window.location.href = '/login';
      return;
    }

    loadAnalytics();
  }, [user, timeRange, filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch analytics data
      // const analyticsData = await fetchAnalytics(filters);
      // setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockPainLevelData = [
    { month: 'Jan', average: 6.2, patients: 45 },
    { month: 'Feb', average: 5.8, patients: 52 },
    { month: 'Mar', average: 5.1, patients: 48 },
    { month: 'Apr', average: 4.7, patients: 55 },
    { month: 'May', average: 4.2, patients: 50 },
    { month: 'Jun', average: 3.8, patients: 58 }
  ];

  const mockTreatmentData = [
    { treatment: 'Topiramate', successRate: 78, patients: 120 },
    { treatment: 'Physical Therapy', successRate: 85, patients: 95 },
    { treatment: 'Botox Injections', successRate: 72, patients: 45 },
    { treatment: 'Lifestyle Modifications', successRate: 65, patients: 80 },
    { treatment: 'Acupuncture', successRate: 58, patients: 35 }
  ];

  const mockPatientDemographics = [
    { ageGroup: '18-30', count: 25, percentage: 20 },
    { ageGroup: '31-45', count: 45, percentage: 36 },
    { ageGroup: '46-60', count: 35, percentage: 28 },
    { ageGroup: '60+', count: 20, percentage: 16 }
  ];

  const mockRevenueData = [
    { month: 'Jan', revenue: 45000, appointments: 120 },
    { month: 'Feb', revenue: 52000, appointments: 135 },
    { month: 'Mar', revenue: 48000, appointments: 125 },
    { month: 'Apr', revenue: 55000, appointments: 145 },
    { month: 'May', revenue: 58000, appointments: 150 },
    { month: 'Jun', revenue: 62000, appointments: 160 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/headacheMD.png" alt="HeadacheMD" className="h-8" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={loadAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Pain Reduction</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">67%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +8% improvement
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treatment Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$127,450</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +15% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pain Level Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Pain Level Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockPainLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Average Pain Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Treatment Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockTreatmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="treatment" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#8884d8" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Patient Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Age Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockPatientDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockPatientDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Update Compliance</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    87%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Appointment Attendance</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    94%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medication Adherence</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    82%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mobile App Usage</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    76%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Patient Satisfaction</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    4.8/5.0
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Wait Time (avg)</span>
                  <Badge variant="outline">
                    12 min
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Follow-up Rate</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    91%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency Visits</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    2.3%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Response Time</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    45ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    99.9%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">HIPAA Compliance</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    100%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Sessions</span>
                  <Badge variant="outline">
                    47
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Analytics Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Report Generated', description: 'Monthly patient outcomes report', time: '2 minutes ago', user: 'Dr. Blake' },
                { action: 'Data Export', description: 'Treatment effectiveness data exported', time: '15 minutes ago', user: 'Admin' },
                { action: 'Alert Triggered', description: 'High pain level detected in patient #1023', time: '1 hour ago', user: 'System' },
                { action: 'EMR Sync', description: 'Patient data synced from Epic EMR', time: '2 hours ago', user: 'System' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time} by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
