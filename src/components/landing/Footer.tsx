'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { config } from '@/lib/config';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: theme.spacing(8, 0, 4),
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

const FooterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: '#cccccc',
  textDecoration: 'none',
  display: 'block',
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#a5c422',
    transform: 'translateX(4px)',
  },
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: '#cccccc',
  border: '1px solid #333333',
  marginRight: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#a5c422',
    borderColor: '#a5c422',
    backgroundColor: 'rgba(165, 196, 34, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    color: '#a5c422',
    marginRight: theme.spacing(1.5),
    fontSize: '20px',
  },
}));

const Footer: React.FC = () => {
  const theme = useTheme();

  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <FooterSection>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalHospitalIcon sx={{ fontSize: 40, color: '#a5c422', mr: 2 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    {config.app.name}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#cccccc',
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  Revolutionizing headache care through innovative nerve compression treatment. 
                  Our board-certified specialists provide advanced medical solutions for lasting relief.
                </Typography>

                {/* Social Media */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <SocialIconButton size="small">
                    <FacebookIcon />
                  </SocialIconButton>
                  <SocialIconButton size="small">
                    <TwitterIcon />
                  </SocialIconButton>
                  <SocialIconButton size="small">
                    <LinkedInIcon />
                  </SocialIconButton>
                  <SocialIconButton size="small">
                    <InstagramIcon />
                  </SocialIconButton>
                </Box>
              </FooterSection>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <FooterSection>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  Quick Links
                </Typography>
                
                <FooterLink href="#home">Home</FooterLink>
                <FooterLink href="#about">About Us</FooterLink>
                <FooterLink href="#services">Services</FooterLink>
                <FooterLink href="#team">Our Team</FooterLink>
                <FooterLink href="/login">Patient Portal</FooterLink>
                <FooterLink href="/admin">Admin</FooterLink>
              </FooterSection>
            </motion.div>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FooterSection>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  Services
                </Typography>
                
                <FooterLink href="#services">Nerve Blocks</FooterLink>
                <FooterLink href="#services">Botox Therapy</FooterLink>
                <FooterLink href="#services">IV Infusions</FooterLink>
                <FooterLink href="#services">Natural Treatments</FooterLink>
                <FooterLink href="#services">Sphenocath</FooterLink>
              </FooterSection>
            </motion.div>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <FooterSection>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  Contact Us
                </Typography>
                
                <ContactItem>
                  <LocationOnIcon />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    River Oaks, Houston, Texas
                  </Typography>
                </ContactItem>
                
                <ContactItem>
                  <PhoneIcon />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    (713) 555-0123
                  </Typography>
                </ContactItem>
                
                <ContactItem>
                  <EmailIcon />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    info@headachemd.org
                  </Typography>
                </ContactItem>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#cccccc',
                    mt: 3,
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(165, 196, 34, 0.2)',
                  }}
                >
                  <strong>Emergency:</strong> If you're experiencing a severe headache, 
                  please call 911 or visit your nearest emergency room immediately.
                </Typography>
              </FooterSection>
            </motion.div>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Box 
            sx={{ 
              borderTop: '1px solid #333333',
              pt: 4,
              mt: 6,
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#999999',
                mb: 2,
              }}
            >
              © {currentYear} {config.app.name}. All rights reserved.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              <FooterLink href="/privacy-policy" sx={{ fontSize: '0.875rem' }}>
                Privacy Policy
              </FooterLink>
              <FooterLink href="/terms" sx={{ fontSize: '0.875rem' }}>
                Terms of Service
              </FooterLink>
              <FooterLink href="/sitemap" sx={{ fontSize: '0.875rem' }}>
                Sitemap
              </FooterLink>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
