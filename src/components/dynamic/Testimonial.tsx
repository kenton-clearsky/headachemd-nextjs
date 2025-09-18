import React from 'react';
import { Box, Typography, Container, Paper, Avatar } from '@mui/material';

interface TestimonialProps {
  quote: string;
  author: string;
  backgroundColor: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, backgroundColor }) => {
  return (
    <Box sx={{ backgroundColor, py: 8 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', margin: '0 auto 16px' }}>“</Avatar>
          <Typography variant="h6" component="blockquote" sx={{ fontStyle: 'italic', mb: 2 }}>
            {quote}
          </Typography>
          <Typography variant="subtitle1" component="cite">
            - {author}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Testimonial;
