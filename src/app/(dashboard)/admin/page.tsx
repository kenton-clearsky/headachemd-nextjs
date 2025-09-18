"use client";

import React, { useState, useEffect } from "react";
import { UsersIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAnalytics, useTrackClick } from "@/hooks/useAnalytics";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Stack,
  useTheme,
  useMediaQuery,
  Select,
} from "@mui/material";
import { RealTimeActivity } from "@/components/analytics/RealTimeActivity";
import { PatientMetricsCard } from "@/components/analytics/PatientMetricsCard";
import { TreatmentEffectivenessChart } from "@/components/analytics/TreatmentEffectivenessChart";
import { HeadachePatternChart } from "@/components/analytics/HeadachePatternChart";
import { PainLevelTrendChart } from "@/components/analytics/PainLevelTrendChart";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as DatabaseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase/config";
import { AnalyticsDashboard, TimePeriod } from "@/types/analytics";
import { Patient } from "@/types/medical";
import { fetchAnalytics, fetchRecentPatients } from "@/lib/services/analytics";
import {
  searchPatients,
  getAllPatients,
  verifyFirebaseConnection,
} from "@/lib/services/patients";
import {
  fetchPatientMetrics,
  fetchTreatmentAnalytics,
  fetchPainTrends,
  fetchHeadachePatterns,
} from "@/lib/services/patientAnalytics";
import { resetPatientData } from "@/utils/reset-patient-data";
import { createAllTestPatientUsers } from "@/utils/create-patient-user";
import { config } from "@/lib/config";
import DatabaseExplorer from "@/components/admin/DatabaseExplorer";
import ContentAnalyzer from "@/components/admin/ContentAnalyzer";
import DataGenerator from "@/components/admin/DataGenerator";
import PatientGenerator from "@/components/admin/PatientGenerator";
import UserManagement from "@/components/admin/UserManagement";
import ConsolidatedUserManagement from "@/components/admin/ConsolidatedUserManagement";
import ContentManagement from "@/components/admin/ContentManagement";
import { EventTimeline } from "@/components/analytics/EventTimeline";
import UserLocationMap from "@/components/analytics/UserLocationMap";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, loading: authLoading, signOut } = useAuth();
  const { trackFeature } = useAnalytics();
  const trackClick = useTrackClick();

  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimePeriod>(TimePeriod.WEEK);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientMetrics, setPatientMetrics] = useState<any>(null);
  const [treatmentAnalytics, setTreatmentAnalytics] = useState<any[]>([]);
  const [painTrends, setPainTrends] = useState<any>(null);
  const [headachePatterns, setHeadachePatterns] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });
  const [postCaption, setPostCaption] = useState<string>("");
  const [postFiles, setPostFiles] = useState<
    Array<{
      file: File;
      previewUrl: string;
      kind: "image" | "video";
      progress: number;
    }>
  >([]);
  const [postTag, setPostTag] = useState<"text" | "image" | "video" | "mix">(
    "text"
  );
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [emrSystem, setEmrSystem] = useState<string>("eclinicalworks");
  const [testPatientId, setTestPatientId] = useState<string>("");
  const [emrFirstName, setEmrFirstName] = useState<string>("");
  const [emrLastName, setEmrLastName] = useState<string>("");
  const [emrDateOfBirth, setEmrDateOfBirth] = useState<string>("");
  const [emrLoading, setEmrLoading] = useState<boolean>(false);
  const [emrResponse, setEmrResponse] = useState<any>(null);
  const [emrError, setEmrError] = useState<string | null>(null);

  // Load drawer state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("admin-drawer-collapsed");
    if (savedState !== null) {
      setDrawerCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save drawer state to localStorage
  const handleDrawerCollapse = () => {
    const newState = !drawerCollapsed;
    setDrawerCollapsed(newState);
    localStorage.setItem("admin-drawer-collapsed", JSON.stringify(newState));
  };

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: HomeIcon,
      color: theme.palette.primary.main,
    },
    {
      id: "patients",
      label: "Patients",
      icon: PeopleIcon,
      color: theme.palette.success.main,
    },
    {
      id: "user-management",
      label: "User Management",
      icon: PersonAddIcon,
      color: theme.palette.secondary.main,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: AnalyticsIcon,
      color: theme.palette.info.main,
    },
    {
      id: "realtime",
      label: "Real-time Activity",
      icon: AnalyticsIcon,
      color: theme.palette.success.main,
    },
    {
      id: "treatments",
      label: "Treatments",
      icon: DescriptionIcon,
      color: theme.palette.warning.main,
    },
    {
      id: "emr",
      label: "EMR Test",
      icon: HospitalIcon,
      color: theme.palette.warning.main,
    },
    {
      id: "emr-toggle",
      label: "EMR Integration",
      icon: SettingsIcon,
      color: theme.palette.secondary.main,
    },
    {
      id: "content-management",
      label: "Content Management",
      icon: DescriptionIcon,
      color: theme.palette.primary.main,
    },
    {
      id: "database",
      label: "Database Explorer",
      icon: DatabaseIcon,
      color: theme.palette.secondary.main,
    },
    {
      id: "content",
      label: "Content Analysis",
      icon: DescriptionIcon,
      color: theme.palette.info.main,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      color: theme.palette.grey[600],
    },
  ];

  useEffect(() => {
    // Wait until auth finishes loading to avoid redirect loop on refresh
    if (authLoading) return;
    if (!user || (user.role !== "admin" && user.role !== "doctor")) {
      window.location.href = "/login";
      return;
    }
    loadDashboardData();
  }, [user, authLoading, timeRange]);

  // Keyboard shortcut for drawer toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        handleDrawerCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerCollapsed]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await verifyFirebaseConnection();

      const [
        analyticsData,
        patientsData,
        allPatientsData,
        metricsData,
        treatmentData,
        painData,
        headacheData,
      ] = await Promise.all([
        fetchAnalytics(timeRange),
        fetchRecentPatients(),
        getAllPatients(100),
        fetchPatientMetrics(),
        fetchTreatmentAnalytics(),
        fetchPainTrends(30),
        fetchHeadachePatterns(),
      ]);

      setAnalytics(analyticsData);
      setRecentPatients(patientsData);
      setAllPatients(allPatientsData);
      setPatientMetrics(metricsData);
      setTreatmentAnalytics(treatmentData);
      setPainTrends(painData);
      setHeadachePatterns(headacheData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showSnackbar("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePatientSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPatients(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching patients:", error);
      showSnackbar("Failed to search patients", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewPatient = (patientId: string) => {
    window.open(`/patient/${patientId}`, "_blank");
  };

  const handleResetPatientData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all existing patient data and create new sample data? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      await resetPatientData();
      await loadDashboardData();
      showSnackbar("Patient data has been reset successfully!", "success");
    } catch (error) {
      console.error("Error resetting patient data:", error);
      showSnackbar("Failed to reset patient data", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCreatePatientUsers = async () => {
    if (
      !confirm(
        "Create Firebase Auth users for all sample patients? This will allow testing the patient portal."
      )
    ) {
      return;
    }

    setIsCreatingUsers(true);
    try {
      const results = await createAllTestPatientUsers();
      const successful = results.filter((r) => !("error" in r)).length;
      const failed = results.filter((r) => "error" in r).length;

      showSnackbar(
        `Created ${successful} patient users successfully. ${failed} failed.`,
        "success"
      );
      console.log("Patient user creation results:", results);
    } catch (error) {
      console.error("Error creating patient users:", error);
      showSnackbar("Failed to create patient users", "error");
    } finally {
      setIsCreatingUsers(false);
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const computeSuggestedTag = (
    files: Array<{ kind: "image" | "video" }>
  ): "text" | "image" | "video" | "mix" => {
    if (!files.length) return "text";
    const hasImage = files.some((f) => f.kind === "image");
    const hasVideo = files.some((f) => f.kind === "video");
    if (hasImage && hasVideo) return "mix";
    if (hasImage) return "image";
    return "video";
  };

  const handleSelectFiles = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(evt.target.files || []);
    const mapped = files.map((file) => {
      const kind: "image" | "video" = file.type.startsWith("video/")
        ? "video"
        : "image";
      return { file, previewUrl: URL.createObjectURL(file), kind, progress: 0 };
    });
    const merged = [...postFiles, ...mapped];
    setPostFiles(merged);
    setPostTag(computeSuggestedTag(merged));
  };

  const handleRemoveFile = (idx: number) => {
    const copy = [...postFiles];
    const removed = copy.splice(idx, 1)[0];
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    setPostFiles(copy);
    setPostTag(computeSuggestedTag(copy));
  };

  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firstName = userData.profile?.firstName || "";
        const lastName = userData.profile?.lastName || "";
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User";
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!user) {
        showSnackbar("You must be signed in", "error");
        return;
      }
      if (!postCaption && postFiles.length === 0) {
        showSnackbar("Add a caption or at least one media file", "warning");
        return;
      }
      setIsPosting(true);

      const postRef = doc(collection(db, "posts"));
      const postId = postRef.id;

      const uploadedMedia: Array<{
        type: "image" | "video";
        url: string;
        path: string;
        name: string;
        size: number;
      }> = [];
      for (let i = 0; i < postFiles.length; i++) {
        const item = postFiles[i];
        const storagePath = `posts/${postId}/${Date.now()}_${encodeURIComponent(
          item.file.name
        )}`;
        const sRef = ref(storage, storagePath);
        await new Promise<void>((resolve, reject) => {
          // Add metadata to help with CORS
          const metadata = {
            contentType: item.file.type,
            customMetadata: {
              uploadedBy: user.id,
              uploadedAt: new Date().toISOString(),
            },
          };
          const task = uploadBytesResumable(sRef, item.file, metadata);
          task.on(
            "state_changed",
            (snap) => {
              const pct = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100
              );
              setPostFiles((curr) =>
                curr.map((pf, idx) =>
                  idx === i ? { ...pf, progress: pct } : pf
                )
              );
            },
            (err) => reject(err),
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);
              uploadedMedia.push({
                type: item.kind,
                url,
                path: storagePath,
                name: item.file.name,
                size: item.file.size,
              });
              resolve();
            }
          );
        });
      }

      const finalTag = postTag || computeSuggestedTag(postFiles);

      // Get author name from user profile
      const authorName = await fetchUserName(user.id);

      const postDoc = {
        authorId: user.id,
        authorEmail: user.email,
        authorName: authorName,
        caption: postCaption || "",
        tag: finalTag,
        media: uploadedMedia,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        status: "draft", // Default to draft, can be published from Content Management
      };
      await setDoc(postRef, postDoc);

      postFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setPostFiles([]);
      setPostCaption("");
      setPostTag("text");
      showSnackbar(
        "Post saved as draft. Use Content Management to publish.",
        "success"
      );
    } catch (error) {
      showSnackbar(
        (error as Error).message || "Failed to create post",
        "error"
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleStartEmrAuth = () => {
    const params = new URLSearchParams();
    if (testPatientId) params.append("patientId", testPatientId);
    if (emrFirstName) params.append("firstName", emrFirstName);
    if (emrLastName) params.append("lastName", emrLastName);
    if (emrDateOfBirth) params.append("dateOfBirth", emrDateOfBirth);

    const url = `/api/emr/auth/${emrSystem}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.location.href = url;
  };

  const handleFetchEmrPatient = async () => {
    if (!testPatientId.trim() && !emrFirstName.trim() && !emrLastName.trim()) {
      showSnackbar("Enter either a Patient ID or First/Last Name", "warning");
      return;
    }
    setEmrLoading(true);
    setEmrError(null);
    setEmrResponse(null);
    try {
      let res;
      let data;

      if (testPatientId.trim()) {
        // Use patient endpoint for specific patient ID
        const params = new URLSearchParams();
        params.append("system", emrSystem);
        params.append("patientId", testPatientId);

        res = await fetch(`/api/emr/patient?${params.toString()}`);
        data = await res.json();
      } else {
        // Use search endpoint for name/DOB search
        if (
          !emrFirstName.trim() ||
          !emrLastName.trim() ||
          !emrDateOfBirth.trim()
        ) {
          showSnackbar(
            "For name search, please provide First Name, Last Name, and Date of Birth",
            "warning"
          );
          setEmrLoading(false);
          return;
        }

        const params = new URLSearchParams();
        params.append("system", emrSystem);
        params.append("firstName", emrFirstName);
        params.append("lastName", emrLastName);
        params.append("dateOfBirth", emrDateOfBirth);

        res = await fetch(`/api/emr/search?${params.toString()}`);
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch patient data");
      }
      setEmrResponse(data);
      showSnackbar("Fetched EMR patient data", "success");
    } catch (error) {
      const message =
        (error as Error).message || "Failed to fetch patient data";
      setEmrError(message);
      showSnackbar(message, "error");
    } finally {
      setEmrLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo and Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 1,
          backdropFilter: "blur(8px)",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
            minHeight: 40,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "1.2rem",
                flexShrink: 0,
              }}
            >
              {config.app.name.charAt(0)}
            </Box>
            <Box
              sx={{
                opacity: drawerCollapsed ? 0 : 1,
                transform: drawerCollapsed
                  ? "translateX(-20px)"
                  : "translateX(0)",
                transition: "all 0.3s ease",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                Admin
              </Typography>
            </Box>
          </Box>

          {/* Collapse/Expand Button */}
          <IconButton
            onClick={handleDrawerCollapse}
            size="small"
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
                transform: "scale(1.1)",
              },
            }}
            title={`${drawerCollapsed ? "Expand" : "Collapse"} sidebar`}
          >
            {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        <List sx={{ pt: 0 }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5, mx: 1 }}>
                <Tooltip
                  title={drawerCollapsed ? item.label : ""}
                  placement="right"
                  disableHoverListener={!drawerCollapsed}
                >
                  <ListItemButton
                    onClick={() => {
                      setActiveTab(item.id);
                      trackClick(
                        "navigation",
                        "admin-sidebar",
                        `tab-${item.id}`,
                        { tabLabel: item.label }
                      );
                    }}
                    selected={activeTab === item.id}
                    sx={{
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      minHeight: 48,
                      justifyContent: drawerCollapsed ? "center" : "flex-start",
                      "&.Mui-selected": {
                        backgroundColor: `${item.color}15`,
                        borderLeft: drawerCollapsed
                          ? "none"
                          : `4px solid ${item.color}`,
                        transform: drawerCollapsed ? "none" : "translateX(4px)",
                        "&:hover": {
                          backgroundColor: `${item.color}25`,
                        },
                      },
                      "&:hover": {
                        backgroundColor: "action.hover",
                        transform: drawerCollapsed ? "none" : "translateX(2px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: activeTab === item.id ? item.color : "inherit",
                        transition: "color 0.2s ease",
                        minWidth: drawerCollapsed ? "auto" : 40,
                      }}
                    >
                      <Icon />
                    </ListItemIcon>
                    {!drawerCollapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: activeTab === item.id ? 600 : 400,
                            color:
                              activeTab === item.id ? item.color : "inherit",
                            transition: "all 0.2s ease",
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Info - Sticky Bottom */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "sticky",
          bottom: 0,
          zIndex: 1,
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            justifyContent: drawerCollapsed ? "center" : "flex-start",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          {!drawerCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {user?.email || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.role || "Role"} • {user?.id?.slice(-4) || "ID"}
              </Typography>
            </Box>
          )}
        </Box>

        {!drawerCollapsed && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleSignOut}
            startIcon={<LogoutIcon />}
            sx={{
              borderColor: "error.main",
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
                borderColor: "error.main",
              },
            }}
          >
            Sign Out
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: "border-box",
            position: "fixed",
            height: "100vh",
            overflowY: "auto",
            transition: "width 0.3s ease",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              },
            },
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          ml: {
            md: `${drawerCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px`,
          }, // Dynamic margin based on drawer state
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Top App Bar - Sticky */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            color: "text.primary",
            backdropFilter: "blur(8px)",
            zIndex: 1100,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <DashboardIcon />
            </IconButton>

            {/* Desktop Drawer Toggle Button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerCollapse}
              sx={{ mr: 2, display: { xs: "none", md: "block" } }}
              title={`${
                drawerCollapsed ? "Expand" : "Collapse"
              } sidebar (Ctrl+B)`}
            >
              {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {navigationItems.find((item) => item.id === activeTab)?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your headacheMD practice
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton onClick={handleProfileMenuOpen} color="inherit">
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  >
                    {user?.profile.firstName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              },
            },
          }}
        >
          {/* Quick Stats - Only show on Overview */}
          {activeTab === "overview" && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          gutterBottom
                          variant="overline"
                        >
                          Total Patients
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          {analytics?.overview.totalPatients.toLocaleString() ||
                            "0"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analytics?.overview.activePatients || 0} active
                          patients
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{ bgcolor: "primary.light", width: 56, height: 56 }}
                      >
                        <PeopleIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          gutterBottom
                          variant="overline"
                        >
                          Today's Appointments
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 600, color: "success.main" }}
                        >
                          {analytics?.overview.appointmentsToday || "0"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analytics?.overview.totalAppointments || 0} total
                          appointments
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{ bgcolor: "success.light", width: 56, height: 56 }}
                      >
                        <CalendarIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          gutterBottom
                          variant="overline"
                        >
                          Active Treatments
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 600, color: "info.main" }}
                        >
                          892
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          94% success rate
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{ bgcolor: "info.light", width: 56, height: 56 }}
                      >
                        <HospitalIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          color="text.secondary"
                          gutterBottom
                          variant="overline"
                        >
                          Revenue (MTD)
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 600, color: "warning.main" }}
                        >
                          $127,450
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          +8.2% from last month
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{ bgcolor: "warning.light", width: 56, height: 56 }}
                      >
                        <MoneyIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab Content */}
          {activeTab === "overview" && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardHeader
                    title={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TrendingUpIcon color="primary" />
                        <Typography variant="h6">Recent Activity</Typography>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      {[
                        {
                          type: "appointment",
                          message:
                            "New appointment scheduled for Sarah Johnson",
                          time: "2 minutes ago",
                          color: "primary",
                        },
                        {
                          type: "treatment",
                          message: "Treatment plan updated for Mike Chen",
                          time: "15 minutes ago",
                          color: "success",
                        },
                        {
                          type: "patient",
                          message: "New patient registration: Emily Davis",
                          time: "1 hour ago",
                          color: "info",
                        },
                        {
                          type: "alert",
                          message: "High pain level reported by patient #1023",
                          time: "2 hours ago",
                          color: "warning",
                        },
                      ].map((activity, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: "action.hover",
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: `${activity.color}.main`,
                              mt: 0.5,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {activity.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {activity.time}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Card>
                  <CardHeader
                    title={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircleIcon color="success" />
                        <Typography variant="h6">System Health</Typography>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "success.light",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          API Response Time
                        </Typography>
                        <Chip label="45ms" size="small" color="success" />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "success.light",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Database Health
                        </Typography>
                        <Chip label="Healthy" size="small" color="success" />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "success.light",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          HIPAA Compliance
                        </Typography>
                        <Chip label="100%" size="small" color="success" />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "info.light",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Active Sessions
                        </Typography>
                        <Chip label="47" size="small" color="info" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Recently Logged In Patients - Only show on Overview */}
          {activeTab === "overview" && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon color="primary" />
                    <Typography variant="h6">
                      Recently Logged In Patients
                    </Typography>
                  </Box>
                }
                subheader="Patients who have recently accessed the system"
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setActiveTab("patients")}
                    sx={{
                      borderColor: "#a5c422",
                      color: "#a5c422",
                      "&:hover": {
                        borderColor: "#8fb01a",
                        backgroundColor: "rgba(165, 196, 34, 0.04)",
                      },
                    }}
                  >
                    View All Patients
                  </Button>
                }
              />
              <CardContent>
                {recentPatients.length > 0 ? (
                  <Grid container spacing={2}>
                    {recentPatients.slice(0, 6).map((patient) => (
                      <Grid item xs={12} sm={6} md={4} key={patient.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: 3,
                              transform: "translateY(-2px)",
                              borderColor: "#a5c422",
                            },
                          }}
                          onClick={() => {
                            // Navigate to patient detail or set active patient
                            setActiveTab("patients");
                            showSnackbar(
                              `Navigating to ${patient.profile.firstName} ${patient.profile.lastName}'s record`,
                              "info"
                            );
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "#a5c422",
                                  width: 40,
                                  height: 40,
                                  fontSize: "1rem",
                                }}
                              >
                                {patient.profile.firstName?.charAt(0)}
                                {patient.profile.lastName?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600 }}
                                  noWrap
                                >
                                  {patient.profile.firstName}{" "}
                                  {patient.profile.lastName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                  noWrap
                                >
                                  {patient.mrn}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                  noWrap
                                >
                                  {patient.lastLogin
                                    ? new Date(
                                        patient.lastLogin
                                      ).toLocaleDateString()
                                    : "Never"}
                                </Typography>
                              </Box>
                              <Chip
                                label="Online"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      No Recent Patient Logins
                    </Typography>
                    <Typography variant="body2">
                      Patients who log in will appear here for easy access
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Generator - Only show on Overview */}
          {activeTab === "overview" && (
            <>
              <PatientGenerator onPatientsGenerated={loadDashboardData} />
              <DataGenerator onDataGenerated={loadDashboardData} />
            </>
          )}

          {activeTab === "user-management" && (
            <Box>
              <ConsolidatedUserManagement />
            </Box>
          )}

          {activeTab === "patients" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SearchIcon color="success" />
                    <Typography variant="h6">
                      Patient Search & Management
                    </Typography>
                  </Box>
                }
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      showSnackbar(
                        "Add patient functionality coming soon!",
                        "info"
                      )
                    }
                  >
                    Add Patient
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  {/* Enhanced Search Bar */}
                  <TextField
                    fullWidth
                    placeholder="Search by name, email, or MRN (e.g., 'Sarah Johnson', 'MRN001', 'sarah@email.com')"
                    value={searchTerm}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: isSearching && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ maxWidth: 600 }}
                  />

                  {/* Enhanced Patient Table */}
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ border: 1, borderColor: "divider" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Patient
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>MRN</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Contact
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Last Updated
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(searchTerm ? searchResults : allPatients).map(
                          (patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {patient.profile.firstName}{" "}
                                    {patient.profile.lastName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    DOB:{" "}
                                    {patient.profile.dateOfBirth.toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={patient.mrn}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: "monospace" }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {patient.profile.email}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {patient.profile.phone}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    patient.isActive ? "Active" : "Inactive"
                                  }
                                  color={
                                    patient.isActive ? "success" : "default"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {patient.updatedAt.toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleViewPatient(patient.id)
                                      }
                                      color="primary"
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" color="info">
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                        {(searchTerm ? searchResults : allPatients).length ===
                          0 &&
                          !isSearching && (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                sx={{ textAlign: "center", py: 8 }}
                              >
                                <Box sx={{ textAlign: "center" }}>
                                  <SearchIcon
                                    sx={{
                                      fontSize: 48,
                                      color: "text.disabled",
                                      mb: 2,
                                    }}
                                  />
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    gutterBottom
                                  >
                                    No patients found
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Try adjusting your search terms
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Enhanced Search Tips */}
                  {searchTerm && (
                    <Alert severity="info" icon={<InfoIcon />}>
                      <Typography variant="subtitle2" gutterBottom>
                        Search Tips:
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2">
                            • Search by full name: "Sarah Johnson"
                          </Typography>
                          <Typography variant="body2">
                            • Search by first or last name: "Sarah" or "Johnson"
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2">
                            • Search by MRN: "MRN001" or just "001"
                          </Typography>
                          <Typography variant="body2">
                            • Search by email: "sarah@email.com"
                          </Typography>
                        </Grid>
                      </Grid>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <Stack spacing={4}>
              {/* Patient Metrics */}
              {patientMetrics && (
                <PatientMetricsCard
                  metrics={patientMetrics}
                  loading={loading}
                />
              )}

              {/* Treatment Effectiveness */}
              {treatmentAnalytics && treatmentAnalytics.length > 0 && (
                <TreatmentEffectivenessChart
                  treatmentData={treatmentAnalytics}
                  timeSeriesData={
                    painTrends?.aggregatedData?.map((d: any) => ({
                      date: d.date,
                      painLevel: d.averagePain,
                      medicationEffectiveness: 100 - d.averagePain * 10,
                      functionalImprovement: Math.max(
                        0,
                        100 - d.averagePain * 12
                      ),
                    })) || []
                  }
                  loading={loading}
                />
              )}

              {/* Headache Patterns */}
              {headachePatterns && (
                <HeadachePatternChart
                  frequencyData={headachePatterns.frequencyData || []}
                  triggerData={headachePatterns.triggerData || []}
                  timePatternData={headachePatterns.timePatternData || []}
                  loading={loading}
                />
              )}

              {/* Pain Level Trends */}
              {painTrends && (
                <PainLevelTrendChart
                  aggregatedData={painTrends.aggregatedData || []}
                  patientData={painTrends.patientData || []}
                  loading={loading}
                />
              )}

              {/* Event Timeline */}
              <EventTimeline />
            </Stack>
          )}

          {activeTab === "realtime" && (
            <Stack spacing={3}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AnalyticsIcon color="success" />
                      <Typography variant="h6">
                        Real-time User Activity
                      </Typography>
                    </Box>
                  }
                />
                <CardContent>
                  <RealTimeActivity />
                </CardContent>
              </Card>

              <UserLocationMap />
            </Stack>
          )}

          {activeTab === "treatments" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionIcon color="warning" />
                    <Typography variant="h6">Treatment Management</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <DescriptionIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Treatment Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Treatment management interface will be implemented here.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === "database" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DatabaseIcon color="secondary" />
                    <Typography variant="h6">Database Explorer</Typography>
                  </Box>
                }
              />
              <CardContent>
                <DatabaseExplorer />
              </CardContent>
            </Card>
          )}

          {activeTab === "content" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionIcon color="info" />
                    <Typography variant="h6">Content Analysis</Typography>
                  </Box>
                }
              />
              <CardContent>
                <ContentAnalyzer />
              </CardContent>
            </Card>
          )}

          {activeTab === "emr-toggle" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SettingsIcon color="secondary" />
                    <Typography variant="h6">
                      EMR Integration Control
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  <Alert severity="success">
                    Your HeadacheMD app has a complete EMR integration framework
                    ready for real patient data!
                  </Alert>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 3,
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Current Mode: Mock Users
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Using pre-defined test patients for development
                        </Typography>
                        <Button
                          variant="contained"
                          color="inherit"
                          onClick={() =>
                            window.open("/admin/emr-toggle", "_blank")
                          }
                          fullWidth
                        >
                          Open EMR Control Panel
                        </Button>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 3,
                          bgcolor: "success.light",
                          color: "success.contrastText",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          EMR Integration Ready
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          eClinicalWorks FHIR R4 configured and tested
                        </Typography>
                        <Button
                          variant="contained"
                          color="inherit"
                          onClick={() => window.open("/emr-demo", "_blank")}
                          fullWidth
                        >
                          Test EMR Connection
                        </Button>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Integration Status
                    </Typography>
                    <Stack spacing={2}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <CheckCircleIcon color="success" />
                        <Typography>FHIR R4 Integration Framework</Typography>
                        <Chip label="Ready" color="success" size="small" />
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <CheckCircleIcon color="success" />
                        <Typography>eClinicalWorks Configuration</Typography>
                        <Chip label="Configured" color="success" size="small" />
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <CheckCircleIcon color="success" />
                        <Typography>OAuth2 Authentication Flow</Typography>
                        <Chip
                          label="Implemented"
                          color="success"
                          size="small"
                        />
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <CheckCircleIcon color="success" />
                        <Typography>Patient Data Mapping Service</Typography>
                        <Chip label="Complete" color="success" size="small" />
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <WarningIcon color="warning" />
                        <Typography>eClinicalWorks Developer Portal</Typography>
                        <Chip
                          label="Registration Pending"
                          color="warning"
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </Box>

                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Next Steps:</strong> Complete eClinicalWorks
                      developer portal registration and whitelist your callback
                      URL to enable real patient data access.
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === "emr" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HospitalIcon color="warning" />
                    <Typography variant="h6">EMR Integration Test</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Stack spacing={3} sx={{ maxWidth: 800 }}>
                  <Alert severity="info">
                    Use this tool to initiate OAuth with your EMR sandbox and
                    fetch a Patient by FHIR ID or by patient information (name
                    and DOB).
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="EMR System"
                        value={emrSystem}
                        onChange={(e) => setEmrSystem(e.target.value)}
                        select
                        fullWidth
                      >
                        <MenuItem value="eclinicalworks">
                          eClinicalWorks
                        </MenuItem>
                        <MenuItem value="epic">Epic</MenuItem>
                        <MenuItem value="cerner">Cerner</MenuItem>
                        <MenuItem value="allscripts">Allscripts</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="FHIR Patient ID"
                        placeholder="Enter Patient ID (e.g., 123 or Patient/123)"
                        value={testPatientId}
                        onChange={(e) => setTestPatientId(e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    Patient Information (Alternative to Patient ID)
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="First Name"
                        placeholder="Enter patient's first name"
                        value={emrFirstName}
                        onChange={(e) => setEmrFirstName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        placeholder="Enter patient's last name"
                        value={emrLastName}
                        onChange={(e) => setEmrLastName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={emrDateOfBirth}
                        onChange={(e) => setEmrDateOfBirth(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={handleStartEmrAuth}
                      startIcon={<HospitalIcon />}
                    >
                      Start OAuth
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleFetchEmrPatient}
                      disabled={emrLoading}
                      startIcon={<SearchIcon />}
                    >
                      {emrLoading ? "Searching..." : "Search/Fetch Patient"}
                    </Button>
                  </Stack>

                  {emrError && <Alert severity="error">{emrError}</Alert>}

                  {emrResponse && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Response
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "background.default",
                          maxHeight: 400,
                          overflow: "auto",
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {JSON.stringify(emrResponse, null, 2)}
                        </pre>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === "content-management" && <ContentManagement />}

          {activeTab === "settings" && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SettingsIcon sx={{ color: "text.secondary" }} />
                    <Typography variant="h6">System Settings</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Stack spacing={4}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        EMR Integration
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<HospitalIcon />}
                        fullWidth
                      >
                        Configure EMR Settings
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        HIPAA Compliance
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        fullWidth
                      >
                        View Compliance Report
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Mobile App Settings
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        fullWidth
                      >
                        Configure Mobile APIs
                      </Button>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Development Tools
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Button
                          variant="outlined"
                          onClick={handleCreatePatientUsers}
                          disabled={isCreatingUsers}
                          startIcon={<PeopleIcon />}
                          fullWidth
                        >
                          {isCreatingUsers
                            ? "Creating Users..."
                            : "Create Patient Test Users"}
                        </Button>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 1, ml: 4 }}
                        >
                          Create Firebase Auth users for sample patients
                          (password: patient123)
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleResetPatientData}
                          disabled={isResetting}
                          startIcon={<RefreshIcon />}
                          fullWidth
                        >
                          {isResetting ? "Resetting..." : "Reset Patient Data"}
                        </Button>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 1, ml: 4 }}
                        >
                          Delete all existing patients and create new sample
                          data with correct structure
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
