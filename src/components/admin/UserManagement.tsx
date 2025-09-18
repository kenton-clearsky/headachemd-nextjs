"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
  AdminPanelSettings as AdminIcon,
  Healing as HealingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  createUser,
  createDoctorUser,
  createAdminUserWithDetails,
  createPatientUser,
} from "@/utils/create-patient-user";

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
}

interface CreatedUser {
  uid: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
  };
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

export default function UserManagement() {
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
  });

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

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
      // Reset specialty when changing role
      specialty: event.target.value === "doctor" ? prev.specialty : "",
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password.trim()) return "Password is required";
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (formData.password.length < 6)
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
        // For patients, try the standard patient creation first
        try {
          result = await createPatientUser(formData.email, formData.password);
        } catch (patientError) {
          // If that fails, create a generic patient user
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

      setCreatedUser(result);
      setDialogOpen(true);

      // Reset form
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
      });
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = (error as Error).message || "Failed to create user";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <Box>
      <Grid container spacing={4}>
        {/* User Creation Form */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonAddIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Add New User
                  </Typography>
                </Box>
              }
              subheader="Create new users with different roles in the system"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                {/* Role Selection Section */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
                  >
                    1. Select User Role
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>User Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="User Role"
                      onChange={handleRoleChange}
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        },
                      }}
                    >
                      <MenuItem value="patient">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "success.light",
                              width: 32,
                              height: 32,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">Patient</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Access to personal health records
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="doctor">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "primary.light",
                              width: 32,
                              height: 32,
                            }}
                          >
                            <HospitalIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">Doctor</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Medical professional access
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "error.light",
                              width: 32,
                              height: 32,
                            }}
                          >
                            <AdminIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              Administrator
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Full system access
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Personal Information Section */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
                  >
                    2. Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange("firstName")}
                        required
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange("lastName")}
                        required
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Information Section */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
                  >
                    3. Contact Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        InputProps={{
                          startAdornment: (
                            <EmailIcon
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                          ),
                        }}
                        required
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange("phone")}
                        InputProps={{
                          startAdornment: (
                            <PhoneIcon
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                          ),
                        }}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Role-specific Information Section */}
                {(formData.role === "doctor" ||
                  formData.role === "patient") && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
                      >
                        4.{" "}
                        {formData.role === "doctor"
                          ? "Professional Information"
                          : "Additional Information"}
                      </Typography>

                      {formData.role === "doctor" && (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Medical Specialty</InputLabel>
                          <Select
                            value={formData.specialty}
                            label="Medical Specialty"
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                specialty: String(
                                  (e as SelectChangeEvent<string>).target.value
                                ),
                              }))
                            }
                            required
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "grey.50",
                              },
                            }}
                          >
                            {medicalSpecialties.map((specialty) => (
                              <MenuItem key={specialty} value={specialty}>
                                {specialty}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {formData.role === "patient" && (
                        <TextField
                          fullWidth
                          label="Date of Birth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange("dateOfBirth")}
                          InputLabelProps={{ shrink: true }}
                          required
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                          }}
                        />
                      )}
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Security Section */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
                  >
                    5. Security Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        InputProps={{
                          startAdornment: (
                            <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                          ),
                        }}
                        required
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                        }}
                        helperText="Minimum 6 characters"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange("confirmPassword")}
                        InputProps={{
                          startAdornment: (
                            <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                          ),
                        }}
                        required
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { bgcolor: "grey.50" },
                        }}
                        error={
                          formData.password !== formData.confirmPassword &&
                          formData.confirmPassword !== ""
                        }
                        helperText={
                          formData.password !== formData.confirmPassword &&
                          formData.confirmPassword !== ""
                            ? "Passwords do not match"
                            : ""
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    pt: 2,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PersonAddIcon />
                      )
                    }
                    sx={{
                      minWidth: 220,
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {loading ? "Creating User..." : "Create User"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() =>
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
                      })
                    }
                    sx={{
                      minWidth: 150,
                      py: 1.5,
                      fontSize: "1rem",
                    }}
                  >
                    Reset Form
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Panel */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Role Information Card */}
            <Card elevation={1} sx={{ position: "sticky", top: 20 }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      User Roles
                    </Typography>
                  </Box>
                }
                subheader="Understanding user permissions"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "grey.50",
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Admin Role */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "error.50",
                      border: 1,
                      borderColor: "error.200",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{ bgcolor: "error.main", width: 40, height: 40 }}
                      >
                        <AdminIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Administrator
                        </Typography>
                        <Chip label="Full Access" size="small" color="error" />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.4 }}
                    >
                      Complete system control including user management,
                      analytics, system configuration, and all administrative
                      functions.
                    </Typography>
                  </Box>

                  {/* Doctor Role */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "primary.50",
                      border: 1,
                      borderColor: "primary.200",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 40, height: 40 }}
                      >
                        <HospitalIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Doctor
                        </Typography>
                        <Chip
                          label="Medical Access"
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.4 }}
                    >
                      Medical professionals with access to patient records,
                      treatment plans, clinical tools, and appointment
                      management.
                    </Typography>
                  </Box>

                  {/* Patient Role */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "success.50",
                      border: 1,
                      borderColor: "success.200",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{ bgcolor: "success.main", width: 40, height: 40 }}
                      >
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Patient
                        </Typography>
                        <Chip
                          label="Personal Access"
                          size="small"
                          color="success"
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.4 }}
                    >
                      Personal health record access, appointment scheduling,
                      symptom tracking, and treatment progress monitoring.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card elevation={1}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Quick Tips
                    </Typography>
                  </Box>
                }
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "success.50",
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <CheckCircleIcon
                      color="success"
                      sx={{ fontSize: 20, mt: 0.5 }}
                    />
                    <Typography variant="body2">
                      <strong>Role Selection:</strong> Choose the appropriate
                      role based on the user's intended system access level.
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <CheckCircleIcon
                      color="success"
                      sx={{ fontSize: 20, mt: 0.5 }}
                    />
                    <Typography variant="body2">
                      <strong>Security:</strong> Passwords must be at least 6
                      characters. Users can change passwords after first login.
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <CheckCircleIcon
                      color="success"
                      sx={{ fontSize: 20, mt: 0.5 }}
                    />
                    <Typography variant="body2">
                      <strong>Patient Linking:</strong> Patient accounts will
                      automatically link to existing patient records with
                      matching email addresses.
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      <strong>Account Activation:</strong> New users will
                      receive login credentials and can immediately access their
                      role-appropriate features.
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Success Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "success.50",
            borderBottom: 1,
            borderColor: "success.200",
            py: 3,
          }}
        >
          <Avatar sx={{ bgcolor: "success.main", width: 48, height: 48 }}>
            <CheckCircleIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "success.800" }}
            >
              User Created Successfully!
            </Typography>
            <Typography variant="body2" color="success.600">
              The new user account is ready to use
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {createdUser && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mb: 3,
                  p: 2,
                  bgcolor: `${getRoleColor(createdUser.role)}.50`,
                  borderRadius: 2,
                  border: 1,
                  borderColor: `${getRoleColor(createdUser.role)}.200`,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${getRoleColor(createdUser.role)}.main`,
                    width: 60,
                    height: 60,
                    boxShadow: 2,
                  }}
                >
                  {getRoleIcon(createdUser.role)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {createdUser.profile.firstName}{" "}
                    {createdUser.profile.lastName}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Chip
                      label={
                        createdUser.role.charAt(0).toUpperCase() +
                        createdUser.role.slice(1)
                      }
                      color={getRoleColor(createdUser.role) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Role Assigned
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: "monospace" }}
                  >
                    ID: {createdUser.uid.slice(0, 8)}...
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EmailIcon color="action" sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {createdUser.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PersonIcon color="action" sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {createdUser.profile.firstName}{" "}
                      {createdUser.profile.lastName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AdminIcon color="action" sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      User Role
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {createdUser.role.charAt(0).toUpperCase() +
                        createdUser.role.slice(1)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Alert severity="success" sx={{ mt: 3, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ✅ Account created and ready for use
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  The user can now log in with their email address and the
                  password you provided.
                  {createdUser.role === "patient" &&
                    " Their account will automatically link to any existing patient records with the same email address."}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            size="large"
            sx={{ minWidth: 120, fontWeight: 600 }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
