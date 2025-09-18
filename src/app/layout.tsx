import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";
import Link from "next/link";
import { Toaster, ToasterProvider } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import { config } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${config.app.name} - Revolutionizing Headache Care`,
  description:
    "Modern web application for doctors and patients to interact on multiple platforms for daily patient updates and analytics generation.",
  authors: [{ name: `${config.app.name} Team` }],
  keywords: [
    "headache",
    "medical",
    "healthcare",
    "patient portal",
    "doctor dashboard",
  ],
  openGraph: {
    title: `${config.app.name} - Revolutionizing Headache Care`,
    description:
      "A comprehensive medical platform for headache treatment and patient management.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeadacheMD - Revolutionizing Headache Care",
    description:
      "A comprehensive medical platform for headache treatment and patient management.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1976d2", // Updated to match MUI primary color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <MuiThemeProvider>
          <ToasterProvider>
            <AuthProvider>
              <AnalyticsProvider>
                <div style={{ minHeight: "100vh" }}>
                  <Header />
                  {children}

                  <footer style={{ padding: "16px 0" }}>
                    <div
                      style={{
                        textAlign: "center",
                        color: "text.secondary",
                        fontSize: "14px",
                      }}
                    >
                      <p>
                        &copy; 2024 headacheMD. All rights reserved. |{" "}
                        <Link
                          href="/privacy-policy"
                          style={{ textDecoration: "underline" }}
                        >
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </footer>
                </div>
                <Toaster />
              </AnalyticsProvider>
            </AuthProvider>
          </ToasterProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
