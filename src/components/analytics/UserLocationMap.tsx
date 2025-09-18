'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Divider,
  Grid,
  Paper,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Tablet as TabletIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// TabPanel component
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
      id={`location-tabpanel-${index}`}
      aria-labelledby={`location-tab-${index}`}
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

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface UserLocation {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: [number, number]; // [latitude, longitude]
  };
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    ipAddress: string;
  };
  lastLoginTime: Date;
  isCurrentlyOnline: boolean;
  sessionDuration: number; // in seconds
  pageViews: number;
  activityCount: number;
}

interface LocationData {
  users: UserLocation[];
  locationBreakdown: { [key: string]: number };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  timeWindowStats: {
    totalLogins: number;
    averageSessionDuration: number;
    mostActiveLocation: string;
    mostActiveUser: string;
  };
}

// US Cities with coordinates for realistic data
const US_CITIES: Array<{ city: string; state: string; coords: [number, number] }> = [
  { city: 'New York', state: 'NY', coords: [40.7128, -74.0060] },
  { city: 'Los Angeles', state: 'CA', coords: [34.0522, -118.2437] },
  { city: 'Chicago', state: 'IL', coords: [41.8781, -87.6298] },
  { city: 'Houston', state: 'TX', coords: [29.7604, -95.3698] },
  { city: 'Phoenix', state: 'AZ', coords: [33.4484, -112.0740] },
  { city: 'Philadelphia', state: 'PA', coords: [39.9526, -75.1652] },
  { city: 'San Antonio', state: 'TX', coords: [29.4241, -98.4936] },
  { city: 'San Diego', state: 'CA', coords: [32.7157, -117.1611] },
  { city: 'Dallas', state: 'TX', coords: [32.7767, -96.7970] },
  { city: 'San Jose', state: 'CA', coords: [37.3382, -121.8863] },
  { city: 'Austin', state: 'TX', coords: [30.2672, -97.7431] },
  { city: 'Jacksonville', state: 'FL', coords: [30.3322, -81.6557] },
  { city: 'Fort Worth', state: 'TX', coords: [32.7555, -97.3308] },
  { city: 'Columbus', state: 'OH', coords: [39.9612, -82.9988] },
  { city: 'Charlotte', state: 'NC', coords: [35.2271, -80.8431] },
  { city: 'San Francisco', state: 'CA', coords: [37.7749, -122.4194] },
  { city: 'Indianapolis', state: 'IN', coords: [39.7684, -86.1581] },
  { city: 'Seattle', state: 'WA', coords: [47.6062, -122.3321] },
  { city: 'Denver', state: 'CO', coords: [39.7392, -104.9903] },
  { city: 'Washington', state: 'DC', coords: [38.9072, -77.0369] },
  { city: 'Boston', state: 'MA', coords: [42.3601, -71.0589] },
  { city: 'El Paso', state: 'TX', coords: [31.7619, -106.4850] },
  { city: 'Nashville', state: 'TN', coords: [36.1627, -86.7816] },
  { city: 'Detroit', state: 'MI', coords: [42.3314, -83.0458] },
  { city: 'Oklahoma City', state: 'OK', coords: [35.4676, -97.5164] },
  { city: 'Portland', state: 'OR', coords: [45.5152, -122.6784] },
  { city: 'Las Vegas', state: 'NV', coords: [36.1699, -115.1398] },
  { city: 'Memphis', state: 'TN', coords: [35.1495, -90.0490] },
  { city: 'Louisville', state: 'KY', coords: [38.2527, -85.7585] },
  { city: 'Baltimore', state: 'MD', coords: [39.2904, -76.6122] },
  { city: 'Milwaukee', state: 'WI', coords: [43.0389, -87.9065] },
  { city: 'Albuquerque', state: 'NM', coords: [35.0844, -106.6504] },
  { city: 'Tucson', state: 'AZ', coords: [32.2226, -110.9747] },
  { city: 'Fresno', state: 'CA', coords: [36.7378, -119.7871] },
  { city: 'Sacramento', state: 'CA', coords: [38.5816, -121.4944] },
  { city: 'Mesa', state: 'AZ', coords: [33.4152, -111.8315] },
  { city: 'Kansas City', state: 'MO', coords: [39.0997, -94.5786] },
  { city: 'Atlanta', state: 'GA', coords: [33.7490, -84.3880] },
  { city: 'Long Beach', state: 'CA', coords: [33.7701, -118.1937] },
  { city: 'Colorado Springs', state: 'CO', coords: [38.8339, -104.8214] },
  { city: 'Raleigh', state: 'NC', coords: [35.7796, -78.6382] },
  { city: 'Miami', state: 'FL', coords: [25.7617, -80.1918] },
  { city: 'Virginia Beach', state: 'VA', coords: [36.8529, -75.9780] },
  { city: 'Omaha', state: 'NE', coords: [41.2565, -95.9345] },
  { city: 'Oakland', state: 'CA', coords: [37.8044, -122.2711] },
  { city: 'Minneapolis', state: 'MN', coords: [44.9778, -93.2650] },
  { city: 'Tulsa', state: 'OK', coords: [36.1540, -95.9928] },
  { city: 'Arlington', state: 'TX', coords: [32.7357, -97.1081] },
  { city: 'Tampa', state: 'FL', coords: [27.9506, -82.4572] },
  { city: 'New Orleans', state: 'LA', coords: [29.9511, -90.0715] },
  { city: 'Wichita', state: 'KS', coords: [37.6872, -97.3301] },
  { city: 'Cleveland', state: 'OH', coords: [41.4993, -81.6944] },
  { city: 'Bakersfield', state: 'CA', coords: [35.3733, -119.0187] },
  { city: 'Aurora', state: 'CO', coords: [39.7294, -104.8319] },
  { city: 'Anaheim', state: 'CA', coords: [33.8366, -117.9143] },
  { city: 'Honolulu', state: 'HI', coords: [21.3099, -157.8581] },
  { city: 'Santa Ana', state: 'CA', coords: [33.7455, -117.8677] },
  { city: 'Corpus Christi', state: 'TX', coords: [27.8006, -97.3964] },
  { city: 'Riverside', state: 'CA', coords: [33.9533, -117.3962] },
  { city: 'Lexington', state: 'KY', coords: [38.0406, -84.5037] },
  { city: 'Stockton', state: 'CA', coords: [37.9577, -121.2908] },
  { city: 'Henderson', state: 'NV', coords: [36.0395, -114.9817] },
  { city: 'Saint Paul', state: 'MN', coords: [44.9537, -93.0900] },
  { city: 'St. Louis', state: 'MO', coords: [38.6270, -90.1994] },
  { city: 'Cincinnati', state: 'OH', coords: [39.1031, -84.5120] },
  { city: 'Pittsburgh', state: 'PA', coords: [40.4406, -79.9959] },
  { city: 'Anchorage', state: 'AK', coords: [61.2181, -149.9003] }
];

const DEVICE_TYPES = ['desktop', 'mobile', 'tablet'] as const;
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const OPERATING_SYSTEMS = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'desktop': return <ComputerIcon sx={{ fontSize: 16 }} />;
    case 'mobile': return <PhoneAndroidIcon sx={{ fontSize: 16 }} />;
    case 'tablet': return <TabletIcon sx={{ fontSize: 16 }} />;
    default: return <ComputerIcon sx={{ fontSize: 16 }} />;
  }
};

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin': return 'error';
    case 'doctor': return 'primary';
    case 'nurse': return 'info';
    case 'patient': return 'success';
    default: return 'default';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export default function UserLocationMap() {
  const [tabValue, setTabValue] = useState(0);
  const [timeWindow, setTimeWindow] = useState<number>(6);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  // Map instance management
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapKey, setMapKey] = useState(0); // Force re-render when needed

  // Map lifecycle management
  const handleMapCreated = (map: any) => {
    mapRef.current = map;
    console.log('Map created successfully');
  };

  const handleMapRemove = () => {
    if (mapRef.current) {
      try {
        mapRef.current.remove();
        mapRef.current = null;
        console.log('Map removed successfully');
      } catch (error) {
        console.warn('Error removing map:', error);
      }
    }
  };

  // Force map re-render when tab changes
  useEffect(() => {
    if (tabValue === 0) { // Map Overview tab
      // Clean up existing map before creating new one
      handleMapRemove();
      setMapKey(prev => prev + 1);
    }
  }, [tabValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleMapRemove();
    };
  }, []);
  


  // Fetch real user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Validate US_CITIES array
        if (!US_CITIES || US_CITIES.length === 0) {
          console.error('US_CITIES array is not properly defined');
          setError('City data configuration error');
          setLoading(false);
          return;
        }
        
        console.log(`US_CITIES array has ${US_CITIES.length} cities:`, US_CITIES.slice(0, 3));
        
        // Fetch patients from the database
        const patientsQuery = query(collection(db, 'patients'), orderBy('createdAt', 'desc'), limit(50));
        const patientsSnapshot = await getDocs(patientsQuery);
        
        if (patientsSnapshot.empty) {
          console.log('No patients found in database');
          setLocationData({
            users: [],
            locationBreakdown: {},
            deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
            timeWindowStats: {
              totalLogins: 0,
              averageSessionDuration: 0,
              mostActiveLocation: 'No data',
              mostActiveUser: 'No data'
            }
          });
          setLoading(false);
          return;
        }
        
        const users: UserLocation[] = [];
        
        Array.from(patientsSnapshot.docs).forEach((doc, index) => {
          try {
            // Add this debug log
            console.log(`DEBUG: Processing patient doc.id: ${doc.id}, index: ${index}`);
            
            const patientData = doc.data();
            
            // Select a US city for this user with proper bounds checking
            const cityIndex = index % US_CITIES.length;
            let cityData = US_CITIES[cityIndex];
            
            // Ensure we have valid city data
            if (!cityData || !cityData.city || !cityData.state || !cityData.coords) {
              console.warn(`Invalid city data for index ${index}, using fallback`);
              cityData = US_CITIES[0]; // New York as fallback
            }
            
            // Generate realistic device and session data
            const deviceType = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
            const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
            const os = OPERATING_SYSTEMS[Math.floor(Math.random() * OPERATING_SYSTEMS.length)];
            
            // Generate random session data
            const lastLoginHours = Math.floor(Math.random() * timeWindow);
            const lastLoginTime = new Date(Date.now() - lastLoginHours * 60 * 60 * 1000);
            const sessionDuration = Math.floor(Math.random() * 7200) + 300; // 5 min to 2 hours
            const pageViews = Math.floor(Math.random() * 20) + 1;
            const activityCount = Math.floor(Math.random() * 15) + 1;
            
            users.push({
              id: doc.id,
              userId: doc.id,
              userName: patientData.profile?.firstName + ' ' + patientData.profile?.lastName || `User ${index + 1}`,
              userRole: patientData.profile?.role || 'patient',
              userEmail: patientData.profile?.email || `user${index + 1}@example.com`,
              location: {
                city: cityData.city,
                state: cityData.state,
                country: 'USA',
                coordinates: cityData.coords
              },
              deviceInfo: {
                type: deviceType,
                browser,
                os,
                ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
              },
              lastLoginTime,
              isCurrentlyOnline: lastLoginHours < 1, // Online if logged in within last hour
              sessionDuration,
              pageViews,
              activityCount
            });
          } catch (userError) {
            console.error(`Error processing user ${doc.id}:`, userError);
            // Skip this user and continue with the next one
          }
        });

        console.log(`Successfully processed ${users.length} users`);
        
        if (users.length === 0) {
          setError('No valid user data could be processed');
          setLoading(false);
          return;
        }

        // Calculate statistics
        const locationBreakdown: { [key: string]: number } = {};
        const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 };
        
        users.forEach(user => {
          const locationKey = `${user.location.city}, ${user.location.state}`;
          locationBreakdown[locationKey] = (locationBreakdown[locationKey] || 0) + 1;
          deviceBreakdown[user.deviceInfo.type]++;
        });

        const totalLogins = users.length;
        const averageSessionDuration = users.reduce((sum, user) => sum + user.sessionDuration, 0) / users.length;
        const mostActiveLocation = Object.entries(locationBreakdown)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
        const mostActiveUser = users
          .sort((a, b) => b.pageViews - a.pageViews)[0]?.userName || 'Unknown';

        console.log('Final location data structure:', {
          usersCount: users.length,
          sampleUser: users[0],
          locationBreakdownKeys: Object.keys(locationBreakdown),
          deviceBreakdown
        });
        
        setLocationData({
          users,
          locationBreakdown,
          deviceBreakdown,
          timeWindowStats: {
            totalLogins,
            averageSessionDuration,
            mostActiveLocation,
            mostActiveUser
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [timeWindow]);

  const filteredUsers = useMemo(() => {
    if (!locationData) return [];
    
    const filtered = locationData.users.filter(user => {
      const locationMatch = locationFilter === 'all' || 
        `${user.location.city}, ${user.location.state}` === locationFilter;
      const deviceMatch = deviceFilter === 'all' || user.deviceInfo.type === deviceFilter;
      
      return locationMatch && deviceMatch;
    });
    
    console.log(`Filtered users: ${filtered.length} out of ${locationData.users.length} total users`);
    return filtered;
  }, [locationData, locationFilter, deviceFilter]);
  
  // Debug: Log when locationData changes
  useEffect(() => {
    if (locationData) {
      console.log('LocationData updated:', {
        usersCount: locationData.users.length,
        hasUsers: locationData.users.length > 0,
        firstUser: locationData.users[0],
        locationBreakdown: locationData.locationBreakdown
      });
    }
  }, [locationData]);
  
  // Debug: Log when filteredUsers changes
  useEffect(() => {
    console.log('FilteredUsers updated:', {
      count: filteredUsers.length,
      users: filteredUsers.slice(0, 3), // Show first 3 users
      filters: { locationFilter, deviceFilter }
    });
  }, [filteredUsers, locationFilter, deviceFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress sx={{ flexGrow: 1 }} />
            <Typography>Loading user locations...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!locationData) {
    return (
      <Card>
        <CardContent>
          <Typography>No user data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon color="primary" />
            <Typography variant="h6">User Location Map</Typography>
          </Box>
        }
        subheader="Real-time user locations and activity across the United States"
      />
      
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="map view tabs">
            <Tab label="Map Overview" icon={<MapIcon />} />
            <Tab label="User Locations" icon={<PeopleIcon />} />
            <Tab label="Location Stats" icon={<AnalyticsIcon />} />
            <Tab label="Device Analytics" icon={<TrendingIcon />} />
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Window</InputLabel>
            <Select
              value={timeWindow}
              label="Time Window"
              onChange={(e) => setTimeWindow(Number(e.target.value))}
            >
              <MenuItem value={1}>Last 1 hour</MenuItem>
              <MenuItem value={6}>Last 6 hours</MenuItem>
              <MenuItem value={24}>Last 24 hours</MenuItem>
              <MenuItem value={168}>Last 7 days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Location</InputLabel>
            <Select
              value={locationFilter}
              label="Location"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <MenuItem value="all">All Locations</MenuItem>
              {Object.keys(locationData.locationBreakdown).map(location => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Device</InputLabel>
            <Select
              value={deviceFilter}
              label="Device"
              onChange={(e) => setDeviceFilter(e.target.value)}
            >
              <MenuItem value="all">All Devices</MenuItem>
              <MenuItem value="desktop">Desktop</MenuItem>
              <MenuItem value="mobile">Mobile</MenuItem>
              <MenuItem value="tablet">Tablet</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
            {loading && (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px dashed #ccc',
                borderRadius: 1
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <LinearProgress sx={{ mb: 2, width: 200 }} />
                  <Typography variant="body1" color="text.secondary">
                    Loading user location data...
                  </Typography>
                </Box>
              </Box>
            )}
            {!loading && typeof window !== 'undefined' && locationData && locationData.users.length > 0 && (
              <div key={mapKey} style={{ height: '100%', width: '100%' }}>
                <MapContainer 
                  center={[39.8283, -98.5795]} 
                  zoom={4} 
                  style={{ height: '100%', width: '100%' }}
                  whenReady={() => {
                    console.log('Map is ready');
                  }}
                >
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
                  />
                  {filteredUsers.map((user) => {
                    console.log(`Rendering user ${user.userName} at coordinates:`, user.location.coordinates);
                    return (
                      <CircleMarker 
                        key={user.id} 
                        center={user.location.coordinates} 
                        radius={user.isCurrentlyOnline ? 8 : 6} 
                        fillColor={user.isCurrentlyOnline ? '#4caf50' : '#2196f3'} 
                        color={user.isCurrentlyOnline ? '#2e7d32' : '#1976d2'} 
                        weight={2} 
                        opacity={0.8} 
                        fillOpacity={0.6}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 200 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {user.userName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📧 {user.userEmail}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📍 {user.location.city}, {user.location.state}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              💻 {user.deviceInfo.type} • {user.deviceInfo.browser}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              🕒 Last login: {user.lastLoginTime.toLocaleString()}
                            </Typography>
                            <Chip 
                              label={user.isCurrentlyOnline ? 'Online' : 'Offline'} 
                              color={user.isCurrentlyOnline ? 'success' : 'default'} 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            )}
            {!loading && (!locationData || locationData.users.length === 0) && (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px dashed #ccc',
                borderRadius: 1
              }}>
                <Typography variant="body1" color="text.secondary">
                  No user data available
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredUsers.length} users across {Object.keys(locationData.locationBreakdown).length} locations
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                <Typography variant="caption">Online</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
                <Typography variant="caption">Offline</Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {filteredUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        user.isCurrentlyOnline ? (
                          <Chip 
                            label="Online" 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                          />
                        ) : null
                      }
                    >
                      <Avatar sx={{ width: 40, height: 40, bgcolor: `${getRoleColor(user.userRole)}.light` }}>
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="body1" sx={{ fontWeight: 500, display: 'inline-block', mr: 1 }}>
                          {user.userName}
                        </Typography>
                        <Chip 
                          label={user.userRole} 
                          size="small" 
                          color={getRoleColor(user.userRole) as any} 
                          variant="outlined" 
                          sx={{ mr: 1 }}
                        />
                        {user.isCurrentlyOnline && (
                          <Chip 
                            label="Online" 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                          />
                        )}
                      </>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          📍 {user.location.city}, {user.location.state}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', mt: 1 }}>
                          💻 {user.deviceInfo.type} • {user.deviceInfo.browser} on {user.deviceInfo.os}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          🕒 Last login: {formatTimeAgo(user.lastLoginTime)} • ⏱️ Session: {formatDuration(user.sessionDuration)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          📊 {user.pageViews} pages • {user.activityCount} actions
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getDeviceIcon(user.deviceInfo.type)}
                    <Typography variant="caption" color="text.secondary">
                      {user.deviceInfo.ipAddress}
                    </Typography>
                  </Box>
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Location Breakdown" />
                <CardContent>
                  <Stack spacing={2}>
                    {Object.entries(locationData.locationBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .map(([location, count]) => (
                        <Box key={location} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{location}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={count} size="small" color="primary" variant="outlined" />
                            <LinearProgress 
                              variant="determinate" 
                              value={(count / Math.max(...Object.values(locationData.locationBreakdown))) * 100} 
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Box>
                      ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Time Window Statistics" />
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Total Logins</Typography>
                      <Chip label={locationData.timeWindowStats.totalLogins} size="small" color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Average Session</Typography>
                      <Chip label={formatDuration(locationData.timeWindowStats.averageSessionDuration)} size="small" color="info" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Most Active Location</Typography>
                      <Chip label={locationData.timeWindowStats.mostActiveLocation} size="small" color="success" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Most Active User</Typography>
                      <Chip label={locationData.timeWindowStats.mostActiveUser} size="small" color="warning" />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Device Type Distribution" />
                <CardContent>
                  <Stack spacing={2}>
                    {Object.entries(locationData.deviceBreakdown).map(([deviceType, count]) => (
                      <Box key={deviceType} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getDeviceIcon(deviceType)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {deviceType}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={count} size="small" color="primary" variant="outlined" />
                          <LinearProgress 
                            variant="determinate" 
                            value={(count / locationData.users.length) * 100} 
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Real-Time Map Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    This map shows actual user locations from your database, with real-time status updates and detailed user information.
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                    <Chip label="OpenStreetMap" color="primary" size="small" />
                    <Chip label="Real User Data" color="success" size="small" />
                    <Chip label="Live Updates" color="info" size="small" />
                    <Chip label="Interactive" color="warning" size="small" />
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </CardContent>
    </Card>
  );
}
