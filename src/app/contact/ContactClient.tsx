"use client";

import React from 'react';
import {
  Box,
  Container,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';

export default function ContactClient() {
  return (
    <main style={{ minHeight: '100vh', background: '#F4F8E9' }}>
      <Container sx={{ maxWidth: 'lg', py: 3 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1.5, color: '#3A4523', fontWeight: 700 }}>
          Contact Us
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: '#47542B' }}>
          Get in touch with our team. We're here to help with your questions about headache treatment and care.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid #dbe3c9' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#3A4523', fontWeight: 700 }}>
                  Send us a Message
                </Typography>
                <Box component="form" method="POST" action="https://formsubmit.co/5e623f96d7937c204ee6500c187f69b5">
                  <input type="hidden" name="_subject" value="New Contact Form Submission - headacheMD.org" />
                  <input type="hidden" name="_next" value="https://headachemd.org/" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />
                  <input type="hidden" name="_autoresponse" value="Thank you for contacting headacheMD. We have received your message and will get back to you within 24 hours." />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Full Name" name="name" required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth type="email" label="Email Address" name="email" required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth type="tel" label="Phone Number" name="phone" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField select fullWidth label="Subject" name="subject" required defaultValue="">
                        <MenuItem value="">Select a subject</MenuItem>
                        <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                        <MenuItem value="Appointment Request">Appointment Request</MenuItem>
                        <MenuItem value="Treatment Questions">Treatment Questions</MenuItem>
                        <MenuItem value="Insurance Questions">Insurance Questions</MenuItem>
                        <MenuItem value="Referral Information">Referral Information</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Message" name="message" multiline minRows={6} required placeholder="Please describe your inquiry or question..." />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#a5c422', '&:hover': { backgroundColor: '#8fb01a' }, px: 3 }}>
                          Get Expert Help Today
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ border: '1px solid #dbe3c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#3A4523', fontWeight: 700 }}>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#47542B', mb: 1 }}>
                    2711 Ferndale St
                    <br />
                    Houston, TX 77098
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#47542B', mb: 1 }}>
                    Phone: 713-426-3337
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#47542B' }}>
                    Hours:
                    <br />Mon - Thu: 8:30 AM - 5:00 PM CST
                    <br />Fri: 9:00 AM - 3:00 PM CST
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ border: '1px solid #dbe3c9', overflow: 'hidden' }}>
                <Box component="img" src="/legacy/images/author-image.jpg" alt="Contact" sx={{ width: '100%', display: 'block' }} />
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
