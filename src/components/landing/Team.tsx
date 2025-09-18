'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const TeamContainer = styled(Box)(({ theme }) => ({
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

const TeamMemberCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(165, 196, 34, 0.1)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 60px rgba(165, 196, 34, 0.15)',
    border: '1px solid rgba(165, 196, 34, 0.3)',
    '& .member-image': {
      transform: 'scale(1.05)',
    },
    '& .social-links': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const TeamMemberImage = styled(CardMedia)(({ theme }) => ({
  height: '320px',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
}));

const SocialLinks = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  opacity: 0,
  transform: 'translateY(-10px)',
  transition: 'all 0.3s ease',
}));

const SocialButton = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#a5c422',
    transform: 'scale(1.1)',
    '& svg': {
      color: '#ffffff',
    },
  },
  '& svg': {
    color: '#a5c422',
    fontSize: '20px',
    transition: 'all 0.2s ease',
  },
}));

const teamMembers = [
  { 
    name: 'Dr. Pamela Blake', 
    title: 'Founder & Medical Director', 
    specialty: 'Board Certified Neurologist & Headache Medicine Specialist',
    image: '/team-image1.jpg',
    experience: '15+ years',
    education: 'Harvard Medical School',
    linkedin: '#',
    email: 'dr.blake@headachemd.org'
  },
  { 
    name: 'Dr. Jessica McFarlane', 
    title: 'Head of Neurology Department', 
    specialty: 'Board Certified Neurologist',
    image: '/team-image2.jpg',
    experience: '12+ years',
    education: 'Stanford Medical School',
    linkedin: '#',
    email: 'dr.mcfarlane@headachemd.org'
  },
  { 
    name: 'Dr. John Doe', 
    title: 'Pain Management Specialist', 
    specialty: 'Board Certified Anesthesiologist',
    image: '/team-image3.jpg',
    experience: '10+ years',
    education: 'Johns Hopkins Medical School',
    linkedin: '#',
    email: 'dr.doe@headachemd.org'
  },
  { 
    name: 'Dr. Jane Smith', 
    title: 'Interventional Pain Specialist', 
    specialty: 'Board Certified Pain Medicine Physician',
    image: '/team-image1.jpg',
    experience: '8+ years',
    education: 'UCLA Medical School',
    linkedin: '#',
    email: 'dr.smith@headachemd.org'
  },
];

const Team: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <TeamContainer id="team" component="section">
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
              Our Team
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
              Meet Our Expert Physicians
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
              Board-certified specialists with decades of combined experience in headache medicine and nerve compression treatment
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TeamMemberCard>
                  <Box sx={{ position: 'relative' }}>
                    <TeamMemberImage
                      image={member.image}
                      title={member.name}
                      className="member-image"
                    />
                    
                    {/* Social Links */}
                    <SocialLinks className="social-links">
                      <SocialButton>
                        <LinkedInIcon />
                      </SocialButton>
                      <SocialButton>
                        <EmailIcon />
                      </SocialButton>
                    </SocialLinks>

                    {/* Experience Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        backgroundColor: '#a5c422',
                        color: '#ffffff',
                        px: 2,
                        py: 0.5,
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {member.experience}
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        mb: 1, 
                        color: '#47542B',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                      }}
                    >
                      {member.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#a5c422',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '0.9rem',
                      }}
                    >
                      {member.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        mb: 2,
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {member.specialty}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalHospitalIcon sx={{ fontSize: '16px', color: '#a5c422', mr: 1 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          fontSize: '0.8rem',
                        }}
                      >
                        {member.education}
                      </Typography>
                    </Box>
                  </CardContent>
                </TeamMemberCard>
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
              Ready to Meet Our Team?
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
              Schedule a consultation with one of our headache specialists and experience the difference that expert care makes.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </TeamContainer>
  );
};

export default Team;
