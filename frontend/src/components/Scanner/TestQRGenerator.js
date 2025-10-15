import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import { QrCode as QRCodeIcon } from '@mui/icons-material';

const TestQRGenerator = () => {
  const [qrData, setQrData] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');

  const generateTestQR = () => {
    if (qrData.trim()) {
      // Create a simple test QR code data
      const testData = {
        vendorId: qrData,
        busId: 'BUS001',
        eventTitle: 'Test Event',
        timestamp: new Date().toISOString()
      };
      
      setGeneratedQR(JSON.stringify(testData));
    }
  };

  const generateSampleQRs = () => {
    const samples = [
      { vendorId: '1', busId: 'BUS001', type: 'Transport' },
      { vendorId: '2', busId: 'BUS002', type: 'Accommodation' },
      { eventTitle: 'Ganga Aarti', eventId: 'EVT001', type: 'Event' }
    ];
    
    return samples.map((sample, index) => (
      <Box key={index} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {sample.type} QR Code:
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="body2" fontFamily="monospace">
            {JSON.stringify(sample)}
          </Typography>
        </Paper>
      </Box>
    ));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <QRCodeIcon sx={{ mr: 1 }} />
        Test QR Code Generator
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Use this tool to generate test QR codes for testing the scanner functionality.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Enter QR Code Data"
            placeholder="e.g., vendor123, bus456, event789"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={generateTestQR}
            disabled={!qrData.trim()}
            fullWidth
          >
            Generate Test QR Code
          </Button>
        </Grid>

        {generatedQR && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Generated QR Code Data:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
              <Typography variant="body2" fontFamily="monospace">
                {generatedQR}
              </Typography>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Copy this data and use it to test the QR scanner
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Sample QR Code Data:
          </Typography>
          {generateSampleQRs()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestQRGenerator;
