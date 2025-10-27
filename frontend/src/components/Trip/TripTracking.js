import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TripTracking = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
        <Typography 
          component="h1" 
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' } }}
        >
          Trip Tracking
        </Typography>
        <Typography 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          This page is currently empty.
        </Typography>
      </Box>
    </Container>
  );
};

export default TripTracking;