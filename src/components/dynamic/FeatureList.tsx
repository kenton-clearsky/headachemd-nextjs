import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

interface Feature {
  title: string;
  description: string;
}

interface FeatureListProps {
  title: string;
  features: Feature[];
  backgroundColor: string;
}

const FeatureList: React.FC<FeatureListProps> = ({ title, features, backgroundColor }) => {
  return (
    <Box sx={{ backgroundColor, py: 8 }}>
      <Container>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
          {title}
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <CheckCircleOutline sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureList;
