"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth/auth";
import { useToast } from "@/components/ui/toaster";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Alert,
  Container,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Email,
  ArrowBack,
  Send,
  CheckCircle,
  Security,
} from "@mui/icons-material";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const theme = useTheme();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const authService = AuthService.getInstance();
      await authService.resetPassword(email);
      setIsSuccess(true);
      toast({
        title: "Password reset email sent!",
        description: `Check your inbox at ${email} for reset instructions.`,
        variant: "success",
        duration: 8000,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #a5c422 0%, #8fb01a 25%, #7a9a15 50%, #6b8a12 75%, #47542B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              backdropFilter: "blur(20px)",
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)",
                p: 4,
                textAlign: "center",
              }}
            >
              <CheckCircle sx={{ fontSize: 60, color: "white", mb: 2 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "white", mb: 1 }}
              >
                Check Your Email
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                Password reset instructions sent
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Alert
                icon={<Email />}
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": {
                    color: "#2e7d32",
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Email Sent Successfully
                </Typography>
                <Typography variant="body2">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Check your inbox and click the link to reset your password.
                </Typography>
              </Alert>

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Didn't receive the email? Check your spam folder or try again
                  with a different email address.
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  sx={{
                    borderColor: "#a5c422",
                    color: "#a5c422",
                    mr: 2,
                    "&:hover": {
                      borderColor: "#8fb01a",
                      backgroundColor: "rgba(165, 196, 34, 0.04)",
                    },
                  }}
                >
                  Try Again
                </Button>

                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    sx={{
                      background:
                        "linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #8fb01a 0%, #7a9a15 100%)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(165, 196, 34, 0.4)",
                      },
                    }}
                  >
                    Back to Login
                  </Button>
                </Link>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", lineHeight: 1.5 }}
                >
                  For security reasons, password reset links expire in 1 hour.
                  <br />
                  If you continue having issues, contact support.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #a5c422 0%, #8fb01a 25%, #7a9a15 50%, #6b8a12 75%, #47542B 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            backdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)",
              p: 4,
              textAlign: "center",
            }}
          >
            <Security sx={{ fontSize: 60, color: "white", mb: 2 }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "white", mb: 1 }}
            >
              Reset Password
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Enter your email to receive reset instructions
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Security Notice */}
            <Alert
              icon={<Security />}
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  color: "#1e40af",
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Secure Password Reset
              </Typography>
              <Typography variant="body2">
                We'll send you a secure link to reset your password. This link
                will expire in 1 hour for your security.
              </Typography>
            </Alert>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            {/* Reset Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#a5c422" }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                helperText="Enter the email address associated with your account"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #8fb01a 0%, #7a9a15 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(165, 196, 34, 0.4)",
                  },
                  "&:disabled": {
                    background: "#e0e0e0",
                  },
                }}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Send />
                  )
                }
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Box>

            {/* Back to Login */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button
                  variant="text"
                  startIcon={<ArrowBack />}
                  sx={{
                    color: "#a5c422",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(165, 196, 34, 0.04)",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Link>
            </Box>

            {/* Help Text */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", lineHeight: 1.5 }}
              >
                Having trouble? Contact your system administrator or
                <br />
                email support at support@headachemd.org
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
