'use client';

import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { config } from '@/lib/config';

const AboutContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  backgroundColor: '#ffffff',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #a5c422 0%, #8fb01a 100%)',
  },
}));

const AboutCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(165, 196, 34, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(165, 196, 34, 0.15)',
    border: '1px solid rgba(165, 196, 34, 0.2)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: 'rgba(165, 196, 34, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    color: '#a5c422',
    fontSize: '28px',
  },
}));

const About: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <VerifiedUserIcon />,
      title: 'Board Certified',
      description: 'All physicians are board certified in their specialties',
    },
    {
      icon: <LocalHospitalIcon />,
      title: 'Specialized Care',
      description: 'Focused expertise in headache medicine and nerve compression',
    },
    {
      icon: <VerifiedUserIcon />,
      title: 'Innovative Methods',
      description: 'Advanced diagnostic and treatment techniques',
    },
  ];

  return (
    <AboutContainer id="about" component="section">
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#a5c422', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '2px',
                mb: 2,
              }}
            >
              Welcome to
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                color: '#47542B', 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
              }}
            >
              About {config.app.name}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666', 
                maxWidth: '600px', 
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Revolutionizing headache care through innovative nerve compression treatment
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Box sx={{ color: '#47542B', lineHeight: 1.8 }}>
                <Typography 
                  component="p" 
                  variant="body1" 
                  sx={{ 
                    mb: 3, 
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                  }}
                >
                  {config.app.name} is a network of medical practices that employ an innovative and effective method for the diagnosis and treatment of headaches and neck pain due to nerve compression. Headaches caused by nerve compression are often misdiagnosed and treated with medications that only provide temporary relief.
                </Typography>
                
                <Typography 
                  component="p" 
                  variant="body1" 
                  sx={{ 
                    mb: 3, 
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                  }}
                >
                  Dr. Blake personally trains all Headache Medicine physicians located at {config.app.name} medical practices in the diagnosis and treatment, both non-surgical and surgical, of nerve compression headache. This ensures consistent, high-quality care across all locations.
                </Typography>
                
                <Typography 
                  component="p" 
                  variant="body1" 
                  sx={{ 
                    mb: 4, 
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                  }}
                >
                  The goal of the network is to reach more refractory headache patients globally in order to identify headaches due to nerve compression, and, if indicated, to consider the option of surgery, either in Houston or with a local, experienced surgeon.
                </Typography>

                <Button 
                  variant="contained" 
                  size="large"
                  sx={{
                    backgroundColor: '#a5c422',
                    color: '#ffffff',
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(165, 196, 34, 0.3)',
                    '&:hover': {
                      backgroundColor: '#8fb01a',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(165, 196, 34, 0.4)',
                    },
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src="/appointment-image.jpg"
                  alt="About Us"
                  sx={{ 
                    width: '100%', 
                    borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  }}
                />
                
                {/* Floating Stats Card */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    backgroundColor: '#a5c422',
                    color: '#ffffff',
                    padding: 3,
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(165, 196, 34, 0.3)',
                    display: { xs: 'none', lg: 'block' },
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    15+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Years of Experience
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ mt: 10 }}>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <AboutCard>
                    <FeatureIcon>
                      {feature.icon}
                    </FeatureIcon>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        mb: 2, 
                        color: '#47542B',
                        fontWeight: 600,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </AboutCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </AboutContainer>
  );
};

export default About;
