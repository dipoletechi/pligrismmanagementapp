import React, { useEffect, useState } from 'react';
import QrReader from 'react-qr-barcode-scanner';
import './QRScanner.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  useMediaQuery,
  useTheme,
  IconButton,
  Paper
} from '@mui/material';
import { 
  QrCodeScanner as ScannerIcon, 
  Close as CloseIcon, 
  CameraAlt as CameraIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const QRScanner = ({ open, onClose, onScanSuccess, onScanError, title = "Scan QR Code" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [delay, setDelay] = useState(300);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (open) {
      setIsScanning(true);
      setError(null);
    } else {
      setIsScanning(false);
    }
  }, [open]);

  const handleScan = (err, result) => {
    if (result && result.getText) {
      const data = result.getText();
      console.log('=== QR CODE DETECTED ===');
      console.log('Scanned Data:', data);
      setResult(data);
      setIsScanning(false);
      onScanSuccess(data, { result: { text: data } });
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setError(`Scanner error: ${err.message}`);
    setIsScanning(false);
    if (onScanError) {
      onScanError(err);
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      console.log('=== MANUAL QR INPUT ===');
      console.log('Manual Input:', manualInput.trim());
      onScanSuccess(manualInput.trim(), { result: { text: manualInput.trim() } });
      setManualInput('');
      setShowManualInput(false);
    }
  };

  const restartScanner = () => {
    setError(null);
    setIsScanning(true);
    setResult('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isMobile ? false : "md"}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          minHeight: isMobile ? '100vh' : '500px',
          margin: isMobile ? 0 : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: isMobile ? 2 : 3,
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScannerIcon sx={{ mr: 1 }} />
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white' }}
          size={isMobile ? "medium" : "small"}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}


        {/* Scanner View */}
        <Box
          sx={{
            position: 'relative',
            minHeight: isMobile ? '70vh' : '400px',
            height: isMobile ? '70vh' : '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            overflow: 'hidden'
          }}
        >
          {isScanning && !showManualInput ? (
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              <QrReader
                delay={delay}
                onError={handleError}
                onUpdate={handleScan}
                style={{ width: '100%', height: '100%' }}
                facingMode="environment" // Use back camera
                legacyMode={false}
              />
              
              {/* Scanning Frame Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isMobile ? 200 : 250,
                  height: isMobile ? 200 : 250,
                  border: '3px solid #00ff00',
                  borderRadius: 2,
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    border: '1px solid rgba(0, 255, 0, 0.3)',
                    borderRadius: 2,
                    animation: 'pulse 2s infinite'
                  }
                }}
              >
                {/* Corner indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 20,
                    height: 20,
                    borderTop: '3px solid #00ff00',
                    borderLeft: '3px solid #00ff00'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    borderTop: '3px solid #00ff00',
                    borderRight: '3px solid #00ff00'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    left: -10,
                    width: 20,
                    height: 20,
                    borderBottom: '3px solid #00ff00',
                    borderLeft: '3px solid #00ff00'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    borderBottom: '3px solid #00ff00',
                    borderRight: '3px solid #00ff00'
                  }}
                />
              </Box>
            </Box>
          ) : showManualInput ? (
            <Box sx={{ textAlign: 'center', p: 3, zIndex: 2 }}>
              <CameraIcon sx={{ fontSize: 48, color: 'white', mb: 2 }} />
              <Typography variant="body2" color="white" gutterBottom>
                Camera not available. Enter QR code manually:
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter QR code data manually"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                sx={{ 
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', zIndex: 2 }}>
              <CircularProgress sx={{ mb: 2, color: 'white' }} />
              <Typography variant="body2" color="white">
                Starting camera...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Instructions */}
        <Box sx={{ 
          p: isMobile ? 1.5 : 2, 
          backgroundColor: isMobile ? 'rgba(0,0,0,0.8)' : '#f9f9f9',
          color: isMobile ? 'white' : 'text.secondary'
        }}>
          <Typography 
            variant={isMobile ? "caption" : "body2"} 
            align="center"
            sx={{ 
              display: 'block',
              mb: isMobile ? 1 : 0
            }}
          >
            {showManualInput 
              ? "Camera access denied or not available. You can enter the QR code data manually above."
              : "Position the QR code within the green frame to scan"
            }
          </Typography>
        </Box>
      </DialogContent>

      {/* Mobile-friendly controls */}
      {isMobile && !showManualInput && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          zIndex: 4
        }}>
          <IconButton
            onClick={restartScanner}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
            }}
            disabled={isScanning}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={() => setShowManualInput(true)}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
            }}
          >
            <CameraIcon />
          </IconButton>
        </Box>
      )}

      <DialogActions sx={{ 
        p: isMobile ? 1 : 2,
        backgroundColor: isMobile ? 'rgba(0,0,0,0.9)' : 'transparent',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        {!isMobile && (
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        )}
        {showManualInput ? (
          <Button
            onClick={handleManualSubmit}
            variant="contained"
            disabled={!manualInput.trim()}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Submit
          </Button>
        ) : !isMobile && (
          <>
            <Button
              onClick={() => setShowManualInput(true)}
              variant="outlined"
              startIcon={<CameraIcon />}
            >
              Manual Input
            </Button>
            <Button
              onClick={restartScanner}
              variant="contained"
              disabled={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Restart Scan'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRScanner;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
