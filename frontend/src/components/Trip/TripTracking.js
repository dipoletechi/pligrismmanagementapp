import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TripTracking = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trip Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is currently empty.
        </Typography>
      </Box>
    </Container>
  );
};

export default TripTracking;