"use client";

import React from 'react';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';

export default function MedicalDisclaimerClient() {
  return (
    <main style={{ minHeight: '100vh', background: '#F4F8E9' }}>
      <Container sx={{ maxWidth: 'lg', py: 3 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2, color: '#3A4523', fontWeight: 700 }}>
          Medical Disclaimer
        </Typography>

        <Card sx={{ border: '1px solid #dbe3c9' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: '#47542B', mb: 2 }}>
              <strong>Important Notice:</strong> The information provided on this website is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            </Typography>
            <Typography variant="body1" sx={{ color: '#47542B', mb: 2 }}>
              <strong>Medical Advice:</strong> Always consult with your physician or qualified healthcare provider regarding any medical condition or treatment options. Never disregard professional medical advice or delay seeking treatment based on information found on this website.
            </Typography>
            <Typography variant="body1" sx={{ color: '#47542B', mb: 2 }}>
              <strong>No Medical Recommendations:</strong> This website does not recommend or endorse any specific tests, physicians, products, procedures, or treatments. Reliance on any information provided here is solely at your own risk.
            </Typography>
            <Typography variant="body1" sx={{ color: '#47542B', mb: 2 }}>
              <strong>Emergency Situations:</strong> If you believe you are experiencing a medical emergency, call your doctor or 911 immediately.
            </Typography>
            <Typography variant="body1" sx={{ color: '#47542B' }}>
              <strong>Website Use:</strong> By using this website, you acknowledge and agree to these terms. If you do not agree, please do not use this site.
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#47542B' }}>
            Copyright © 2025 headacheMD.org. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </main>
  );
}
