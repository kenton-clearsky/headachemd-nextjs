"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
  AdminPanelSettings as AdminIcon,
  Healing as HealingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  VpnKey as VpnKeyIcon,
  Send as SendIcon,
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  createUser,
  createDoctorUser,
  createAdminUserWithDetails,
  createPatientUser,
} from "@/utils/create-patient-user";

interface User {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    specialty?: string;
    dateOfBirth?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "admin" | "doctor" | "patient";
  specialty?: string;
  dateOfBirth?: string;
  isActive: boolean;
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

const medicalSpecialties = [
  "Neurology",
  "Internal Medicine",
  "Family Medicine",
  "Emergency Medicine",
  "Cardiology",
  "Psychiatry",
  "Physical Medicine & Rehabilitation",
  "Pain Management",
  "Sports Medicine",
  "Other",
];

export default function EnhancedUserManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [emailResetDialogOpen, setEmailResetDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "patient",
    specialty: "",
    dateOfBirth: "",
    isActive: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load users',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange =
    (field: keyof UserFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      role: event.target.value as UserFormData["role"],
      specialty: event.target.value === "doctor" ? prev.specialty : "",
    }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      confirmPassword: "",
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      phone: user.profile.phone || "",
      role: user.role as "admin" | "doctor" | "patient",
      specialty: user.profile.specialty || "",
      dateOfBirth: user.profile.dateOfBirth || "",
      isActive: user.isActive,
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handlePasswordReset = (user: User) => {
    setSelectedUser(user);
    setPasswordResetDialogOpen(true);
    handleMenuClose();
  };

  const handleEmailReset = (user: User) => {
    setSelectedUser(user);
    setEmailResetDialogOpen(true);
    handleMenuClose();
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";

    // Only validate password if creating new user or changing password
    if (!selectedUser && !formData.password.trim()) return "Password is required";
    if (formData.password && formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (formData.password && formData.password.length < 6)
      return "Password must be at least 6 characters";

    if (formData.role === "doctor" && !formData.specialty) {
      return "Specialty is required for doctors";
    }

    if (formData.role === "patient" && !formData.dateOfBirth) {
      return "Date of birth is required for patients";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: formData.role,
            specialty: formData.specialty,
            dateOfBirth: formData.dateOfBirth,
            isActive: formData.isActive,
            password: formData.password || undefined,
          }),
        });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: 'User updated successfully',
            severity: 'success',
          });
          loadUsers();
          setEditDialogOpen(false);
          setSelectedUser(null);
        } else {
          throw new Error('Failed to update user');
        }
      } else {
        // Create new user
        let result;

        if (formData.role === "admin") {
          result = await createAdminUserWithDetails(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName,
            formData.phone || undefined
          );
        } else if (formData.role === "doctor") {
          result = await createDoctorUser(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName,
            formData.specialty!,
            formData.phone || undefined
          );
        } else {
          try {
            result = await createPatientUser(formData.email, formData.password);
          } catch (patientError) {
            result = await createUser(
              formData.email,
              formData.password,
              "patient",
              {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth
                  ? new Date(formData.dateOfBirth)
                  : undefined,
              }
            );
          }
        }

        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
        loadUsers();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage = (error as Error).message || "Failed to save user";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
        loadUsers();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.password,
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password reset successfully',
          severity: 'success',
        });
        setPasswordResetDialogOpen(false);
        setSelectedUser(null);
        resetForm();
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setSnackbar({
        open: true,
        message: 'Failed to reset password',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailResetSubmit = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/send-reset-email`, {
        method: 'POST',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password reset email sent successfully',
          severity: 'success',
        });
        setEmailResetDialogOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error('Failed to send reset email');
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      setSnackbar({
        open: true,
        message: 'Failed to send reset email',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "patient",
      specialty: "",
      dateOfBirth: "",
      isActive: true,
    });
    setSelectedUser(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <AdminIcon />;
      case "doctor":
        return <HospitalIcon />;
      case "patient":
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "doctor":
        return "primary";
      case "patient":
        return "success";
      default:
        return "default";
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AdminIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Management
              </Typography>
            </Box>
          }
          subheader="Manage users, roles, and permissions"
          action={
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => {
                resetForm();
                setEditDialogOpen(true);
              }}
            >
              Add User
            </Button>
          }
        />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Users" />
            <Tab label="Admins" />
            <Tab label="Doctors" />
            <Tab label="Patients" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${getRoleColor(user.role)}.main` }}>
                          {getRoleIcon(user.role)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.profile.firstName} {user.profile.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                        icon={user.isActive ? <CheckCircleOutlineIcon /> : <BlockIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user.id)}
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.filter(user => user.role === 'admin').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <AdminIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.profile.firstName} {user.profile.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user.id)}
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
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.filter(user => user.role === 'doctor').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <HospitalIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.profile.firstName} {user.profile.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.profile.specialty || 'Not specified'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user.id)}
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
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.filter(user => user.role === 'patient').map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.profile.firstName} {user.profile.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : 'Not specified'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user.id)}
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
        </TabPanel>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditUser(users.find(u => u.id === menuUserId)!)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handlePasswordReset(users.find(u => u.id === menuUserId)!)}>
          <ListItemIcon>
            <VpnKeyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEmailReset(users.find(u => u.id === menuUserId)!)}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Reset Email</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteUser(users.find(u => u.id === menuUserId)!)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit/Create User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleRoleChange}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="patient">Patient</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.role === "doctor" && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={formData.specialty}
                    label="Specialty"
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  >
                    {medicalSpecialties.map((specialty) => (
                      <MenuItem key={specialty} value={specialty}>
                        {specialty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {formData.role === "patient" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange("dateOfBirth")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                required={!selectedUser}
                helperText={selectedUser ? "Leave blank to keep current password" : "Minimum 6 characters"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                required={!selectedUser}
                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ""}
                helperText={
                  formData.password !== formData.confirmPassword && formData.confirmPassword !== ""
                    ? "Passwords do not match"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : (selectedUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.profile.firstName} {selectedUser?.profile.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog
        open={passwordResetDialogOpen}
        onClose={() => setPasswordResetDialogOpen(false)}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Reset password for {selectedUser?.profile.firstName} {selectedUser?.profile.lastName}
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            required
            error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ""}
            helperText={
              formData.password !== formData.confirmPassword && formData.confirmPassword !== ""
                ? "Passwords do not match"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordResetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordResetSubmit}
            variant="contained"
            disabled={loading || formData.password !== formData.confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Reset Dialog */}
      <Dialog
        open={emailResetDialogOpen}
        onClose={() => setEmailResetDialogOpen(false)}
      >
        <DialogTitle>Send Password Reset Email</DialogTitle>
        <DialogContent>
          <Typography>
            Send a password reset email to {selectedUser?.email}?
            The user will receive instructions to reset their password.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailResetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEmailResetSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
