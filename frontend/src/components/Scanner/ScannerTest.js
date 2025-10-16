import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import { QrCode as QRCodeIcon } from '@mui/icons-material';
import QRScanner from './QRScanner';

const ScannerTest = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleScanSuccess = (data, result) => {
    console.log('=== SCAN SUCCESS ===');
    console.log('Data:', data);
    console.log('Result:', result);
    setScanResult(data);
    setScannerOpen(false);
  };

  const handleScanError = (error) => {
    console.error('=== SCAN ERROR ===');
    console.error('Error:', error);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <QRCodeIcon sx={{ mr: 1 }} />
        QR Scanner Test Suite
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Test different QR scanner implementations to find the most reliable one for your use case.
      </Alert>

      <Grid container spacing={3}>
        {/* Scanner Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scanner Controls
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setScannerOpen(true)}
                  color="primary"
                >
                  Test QR Scanner
                </Button>
              </Box>

              {scanResult && (
                <Paper sx={{ p: 2, backgroundColor: '#e8f5e8', mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last Scan Result:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {scanResult}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tabbed Content */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="QR Code Testing" />
              <Tab label="Scanner Info" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ mt: 2 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    QR Code Testing
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Use any QR code to test the scanner. You can generate QR codes using online tools or mobile apps.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setScannerOpen(true)}
                    fullWidth
                  >
                    Test QR Scanner
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    QR Scanner Information
                  </Typography>
                  
                  <Paper sx={{ p: 2, backgroundColor: '#f0f8ff' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      React-QR-Barcode Scanner
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Simpler implementation<br/>
                      • React-native compatible<br/>
                      • Better mobile support<br/>
                      • Cleaner API<br/>
                      • No "MultiFormat Readers" errors
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setScannerOpen(true)}
                      fullWidth
                    >
                      Test QR Scanner
                    </Button>
                  </Paper>
                </CardContent>
              </Card>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* QR Scanner */}
      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        title="QR Scanner Test"
      />
    </Box>
  );
};

export default ScannerTest;
