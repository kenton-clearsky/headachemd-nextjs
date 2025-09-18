'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import SevereColdIcon from '@mui/icons-material/SevereCold';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PublicIcon from '@mui/icons-material/Public';
import SpaIcon from '@mui/icons-material/Spa';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ServicesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  backgroundColor: '#f8f9fa',
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

const ServiceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(165, 196, 34, 0.1)',
  transition: 'all 0.3s ease',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 60px rgba(165, 196, 34, 0.15)',
    border: '1px solid rgba(165, 196, 34, 0.3)',
    '& .service-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      backgroundColor: '#a5c422',
      '& svg': {
        color: '#ffffff',
      },
    },
  },
}));

const ServiceIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'rgba(165, 196, 34, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  transition: 'all 0.3s ease',
  '& svg': {
    color: '#a5c422',
    fontSize: '36px',
    transition: 'all 0.3s ease',
  },
}));

const services = [
  { 
    icon: <OfflineBoltIcon />, 
    title: 'Nerve Blocks', 
    description: 'Advanced nerve block procedures for immediate and lasting headache relief. Our specialized techniques target the root cause of nerve compression.',
    benefits: ['Immediate relief', 'Long-lasting results', 'Minimally invasive']
  },
  { 
    icon: <SevereColdIcon />, 
    title: 'Natural Treatments', 
    description: 'Holistic approaches combining traditional medicine with natural therapies for comprehensive headache management.',
    benefits: ['No side effects', 'Sustainable relief', 'Natural healing']
  },
  { 
    icon: <FavoriteIcon />, 
    title: 'Trigger Point Injections', 
    description: 'Precise injections targeting muscle trigger points that contribute to chronic headache patterns.',
    benefits: ['Targeted treatment', 'Quick procedure', 'Effective results']
  },
  { 
    icon: <PublicIcon />, 
    title: 'Botox Therapy', 
    description: 'FDA-approved Botox treatments for chronic migraines, providing relief for up to 3 months.',
    benefits: ['FDA approved', 'Long-term relief', 'Proven effectiveness']
  },
  { 
    icon: <SpaIcon />, 
    title: 'Sphenocath Treatment', 
    description: 'Innovative sphenopalatine ganglion block using advanced catheter technology for severe headache relief.',
    benefits: ['Advanced technology', 'Severe case treatment', 'Innovative approach']
  },
  { 
    icon: <LocalHospitalIcon />, 
    title: 'IV Infusions', 
    description: 'Intravenous therapies delivering medications directly to the bloodstream for rapid headache relief.',
    benefits: ['Rapid relief', 'Direct delivery', 'Customized treatment']
  },
];

const Services: React.FC = () => {
  const theme = useTheme();

  return (
    <ServicesContainer id="services" component="section">
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
              Our Services
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
              Advanced Headache Treatments
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
              State-of-the-art medical procedures and innovative treatments designed to provide lasting relief from chronic headaches
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ServiceCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <ServiceIcon className="service-icon">
                      {service.icon}
                    </ServiceIcon>
                    
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        mb: 2, 
                        color: '#47542B',
                        fontWeight: 600,
                      }}
                    >
                      {service.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        lineHeight: 1.6,
                        mb: 3,
                        minHeight: '60px',
                      }}
                    >
                      {service.description}
                    </Typography>

                    {/* Benefits List */}
                    <Box sx={{ textAlign: 'left' }}>
                      {service.benefits.map((benefit, benefitIndex) => (
                        <Box 
                          key={benefitIndex}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            color: '#a5c422',
                          }}
                        >
                          <Box
                            sx={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#a5c422',
                              mr: 1.5,
                            }}
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#47542B',
                              fontSize: '0.9rem',
                            }}
                          >
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Learn More Button */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#a5c422',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          '&:hover': {
                            color: '#8fb01a',
                          },
                        }}
                      >
                        Learn More
                        <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '16px' }} />
                      </Typography>
                    </Box>
                  </CardContent>
                </ServiceCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#47542B', 
                mb: 3,
                fontWeight: 600,
              }}
            >
              Ready to Start Your Journey to Relief?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666', 
                mb: 4,
                maxWidth: '500px',
                mx: 'auto',
              }}
            >
              Schedule a consultation with our headache specialists and discover how our advanced treatments can help you find lasting relief.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </ServicesContainer>
  );
};

export default Services;
