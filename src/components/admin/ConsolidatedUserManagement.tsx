"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import AddUserForm from './AddUserForm';

interface User {
  id: string;
  userId?: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'nurse' | 'staff';
  isActive: boolean;
  emailVerified: boolean;
  profileComplete: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    firstName: string;
    lastName: string;
    displayName?: string;
    phone?: string;
    specialty?: string; // For doctors
    dateOfBirth?: string; // For patients
    gender?: string; // For patients
    address?: any; // For patients
    emergencyContact?: any; // For patients
  };
  // Patient-specific data (if this user is a patient)
  mrn?: string;
  medicalHistory?: any;
  headacheProfile?: any;
  insurance?: any;
  assignedDoctors?: string[];
  currentTreatments?: any[];
  appointments?: any[];
  dailyUpdates?: any[];
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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConsolidatedUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User> | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search term, role filter, or status filter changes
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter, activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      const data = await response.json();
      
      // Transform the data to match our interface
      const transformedUsers = (data.users || []).map((user: any) => ({
        id: user.id || user.userId,
        userId: user.userId || user.id,
        email: user.email || '',
        role: user.role || 'patient',
        isActive: user.isActive !== undefined ? user.isActive : true,
        emailVerified: user.emailVerified || false,
        profileComplete: user.profileComplete || false,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          displayName: user.profile?.displayName || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
          phone: user.profile?.phone || '',
          specialty: user.profile?.specialty || '',
          dateOfBirth: user.profile?.dateOfBirth || '',
          gender: user.profile?.gender || '',
          address: user.profile?.address || null,
          emergencyContact: user.profile?.emergencyContact || null
        },
        // Patient-specific data
        mrn: user.mrn || '',
        medicalHistory: user.medicalHistory || null,
        headacheProfile: user.headacheProfile || null,
        insurance: user.insurance || null,
        assignedDoctors: user.assignedDoctors || [],
        currentTreatments: user.currentTreatments || [],
        appointments: user.appointments || [],
        dailyUpdates: user.dailyUpdates || []
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by tab (role)
    if (activeTab === 1) { // Admins tab
      filtered = filtered.filter(user => user.role === 'admin');
    } else if (activeTab === 2) { // Doctors tab
      filtered = filtered.filter(user => user.role === 'doctor');
    } else if (activeTab === 3) { // Patients tab
      filtered = filtered.filter(user => user.role === 'patient');
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.profile.firstName.toLowerCase().includes(term) ||
        user.profile.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.mrn && user.mrn.toLowerCase().includes(term)) ||
        (user.profile.specialty && user.profile.specialty.toLowerCase().includes(term))
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    if (selectedUser) {
      setEditFormData({ ...selectedUser });
    }
    setEditDialogOpen(true);
    setAnchorEl(null); // Close menu but keep selectedUser
  };

  const updateEditFormProfile = (field: string, value: string) => {
    if (!editFormData) return;
    
    setEditFormData({
      ...editFormData,
      profile: {
        firstName: editFormData.profile?.firstName || '',
        lastName: editFormData.profile?.lastName || '',
        ...editFormData.profile,
        [field]: value
      }
    });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Close menu but keep selectedUser
  };

  const handleResetPassword = () => {
    setResetPasswordDialogOpen(true);
    setAnchorEl(null); // Close menu but keep selectedUser
  };

  const handleSendResetEmail = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/send-reset-email`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setSuccess('Password reset email sent successfully');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Failed to send reset email');
    }
    
    handleMenuClose();
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        setSuccess('User updated successfully');
        await loadUsers();
        setEditDialogOpen(false);
        setEditFormData(null);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(`User ${selectedUser.profile.firstName} ${selectedUser.profile.lastName} deleted successfully`);
        await loadUsers();
        setDeleteDialogOpen(false);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        setSuccess(`Password reset successfully for ${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`);
        setResetPasswordDialogOpen(false);
        setNewPassword('');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'doctor': return 'primary';
      case 'patient': return 'success';
      case 'nurse': return 'warning';
      case 'staff': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          Consolidated User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddUserDialogOpen(true)}
          sx={{ ml: 2 }}
        >
          Add User
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="nurse">Nurse</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`All Users (${users.length})`} />
          <Tab label={`Admins (${users.filter(u => u.role === 'admin').length})`} />
          <Tab label={`Doctors (${users.filter(u => u.role === 'doctor').length})`} />
          <Tab label={`Patients (${users.filter(u => u.role === 'patient').length})`} />
        </Tabs>
      </Box>

      {/* Users Table */}
      <TabPanel value={activeTab} index={activeTab}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Profile Complete</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.profile.firstName} {user.profile.lastName}
                      </Typography>
                      {user.mrn && (
                        <Typography variant="caption" color="text.secondary">
                          MRN: {user.mrn}
                        </Typography>
                      )}
                      {user.profile.specialty && (
                        <Typography variant="caption" color="text.secondary">
                          Specialty: {user.profile.specialty}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(user.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.profileComplete ? 'Complete' : 'Incomplete'}
                      color={user.profileComplete ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, user)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredUsers.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No users found matching your criteria
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleResetPassword}>
          <LockResetIcon sx={{ mr: 1 }} />
          Reset Password
        </MenuItem>
        <MenuItem onClick={handleSendResetEmail}>
          <EmailIcon sx={{ mr: 1 }} />
          Send Reset Email
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => {
        setEditDialogOpen(false);
        setEditFormData(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editFormData && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <TextField
                  label="First Name"
                  value={editFormData.profile?.firstName || ''}
                  onChange={(e) => updateEditFormProfile('firstName', e.target.value)}
                  required
                />
                <TextField
                  label="Last Name"
                  value={editFormData.profile?.lastName || ''}
                  onChange={(e) => updateEditFormProfile('lastName', e.target.value)}
                  required
                />
              </Box>
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({
                  ...editFormData,
                  email: e.target.value
                })}
                sx={{ mb: 2 }}
                required
              />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <FormControl>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editFormData.role || 'patient'}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      role: e.target.value as any
                    })}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Phone"
                  value={editFormData.profile?.phone || ''}
                  onChange={(e) => updateEditFormProfile('phone', e.target.value)}
                />
              </Box>
              
              {editFormData.role === 'doctor' && (
                <TextField
                  fullWidth
                  label="Specialty"
                  value={editFormData.profile?.specialty || ''}
                  onChange={(e) => updateEditFormProfile('specialty', e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              
              {editFormData.role === 'patient' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={editFormData.profile?.dateOfBirth || ''}
                    onChange={(e) => updateEditFormProfile('dateOfBirth', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormControl>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editFormData.profile?.gender || ''}
                      onChange={(e) => updateEditFormProfile('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.isActive !== false}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        isActive: e.target.checked
                      })}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.emailVerified || false}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        emailVerified: e.target.checked
                      })}
                    />
                  }
                  label="Email Verified"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialogOpen(false);
              setEditFormData(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => editFormData && handleUpdateUser(editFormData)} 
            variant="contained"
            disabled={actionLoading || !editFormData?.profile?.firstName || !editFormData?.profile?.lastName || !editFormData?.email}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      }}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.profile.firstName} {selectedUser?.profile.lastName}?
            This action cannot be undone and will remove the user from both Firestore and Firebase Authentication.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedUser(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => {
        setResetPasswordDialogOpen(false);
        setNewPassword('');
        setSelectedUser(null);
      }}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Reset password for {selectedUser?.profile.firstName} {selectedUser?.profile.lastName}
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 1 }}
            helperText="Password must be at least 6 characters long"
            error={newPassword.length > 0 && newPassword.length < 6}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    disabled={actionLoading}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setResetPasswordDialogOpen(false);
              setNewPassword('');
              setSelectedUser(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetPasswordSubmit} 
            variant="contained"
            disabled={actionLoading || newPassword.length < 6}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <AddUserForm
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onUserAdded={() => {
          loadUsers();
          setSuccess('User added successfully!');
        }}
      />

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
