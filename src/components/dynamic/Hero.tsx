import React from 'react';
import { Box, Typography, Container } from '@mui/material';

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, backgroundColor }) => {
  return (
    <Box sx={{ backgroundColor, py: 8 }}>
      <Container>
        <Typography variant="h2" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="p">
          {subtitle}
        </Typography>
      </Container>
    </Box>
  );
};

export default Hero;
