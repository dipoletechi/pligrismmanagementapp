import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
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
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraId, setCameraId] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanningArea, setScanningArea] = useState({ width: 250, height: 250 });

  useEffect(() => {
    console.log('=== QR SCANNER USEEFFECT ===');
    console.log('Scanner open state:', open);
    console.log('Scanner ref current:', scannerRef.current);
    
    if (open) {
      console.log('Scanner is opening, getting cameras...');
      getAvailableCameras();
    } else {
      console.log('Scanner is closing, stopping scanner...');
      stopScanner();
    }

    return () => {
      console.log('QR Scanner useEffect cleanup');
      stopScanner();
    };
  }, [open]);

  const getAvailableCameras = async () => {
    try {
      console.log('=== GETTING AVAILABLE CAMERAS ===');
      const cameras = await Html5Qrcode.getCameras();
      console.log('Available cameras:', cameras);
      console.log('Number of cameras found:', cameras.length);
      setAvailableCameras(cameras);
      if (cameras.length > 0) {
        console.log('Setting camera ID to:', cameras[0].id);
        setCameraId(cameras[0].id);
        console.log('Starting scanner with camera:', cameras[0].id);
        startScanner(cameras[0].id);
      } else {
        console.log('No cameras found, showing manual input');
        setError('No cameras found. Please check your camera permissions.');
        setShowManualInput(true);
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      console.log('Camera error details:', err.message);
      setError('Failed to access cameras. Please check permissions.');
      setShowManualInput(true);
    }
  };

  const startScanner = async (selectedCameraId = null) => {
    try {
      console.log('=== STARTING QR SCANNER ===');
      console.log('Selected Camera ID:', selectedCameraId);
      console.log('Scanner Ref Element:', scannerRef.current);
      console.log('Scanner Element ID:', scannerRef.current?.id);
      
      setIsScanning(true);
      setError(null);

      const html5Qrcode = new Html5Qrcode(scannerRef.current.id);
      console.log('Html5Qrcode instance created:', html5Qrcode);
      
      // Mobile-responsive scanning area
      const qrBoxSize = isMobile ? 200 : 250;
      setScanningArea({ width: qrBoxSize, height: qrBoxSize });
      console.log('QR Box Size:', qrBoxSize);
      console.log('Is Mobile:', isMobile);
      
      // Try with minimal config first
      const config = {
        fps: 10,
        qrbox: { width: qrBoxSize, height: qrBoxSize },
        aspectRatio: 1.0
      };
      
      console.log('Using minimal config for testing:', config);
      
      console.log('Scanner Config:', config);
      console.log('About to call html5Qrcode.start()...');

      console.log('Calling html5Qrcode.start() with camera:', selectedCameraId || cameraId);
      
      // Check if we can access the camera first
      try {
        console.log('Testing camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: selectedCameraId || cameraId } 
        });
        console.log('Camera stream obtained successfully:', stream);
        stream.getTracks().forEach(track => track.stop());
        console.log('Camera stream stopped, proceeding with scanner...');
      } catch (cameraError) {
        console.error('Camera access test failed:', cameraError);
        throw new Error(`Camera access denied: ${cameraError.message}`);
      }
      
      // Add a timeout to detect if start() hangs
      const startPromise = html5Qrcode.start(
        selectedCameraId || cameraId,
        config,
        (decodedText, decodedResult) => {
          console.log('=== QR SCANNER DETECTED ===');
          console.log('Scanned Text:', decodedText);
          console.log('Decoded Result:', decodedResult);
          console.log('Scanner stopping...');
          html5Qrcode.stop();
          setIsScanning(false);
          console.log('Calling onScanSuccess...');
          onScanSuccess(decodedText, decodedResult);
        },
        (error) => {
          // Don't show error for every failed scan attempt
          if (error && !error.includes('NotFoundException') && !error.includes('No QR code found')) {
            console.warn('QR Scan error:', error);
          }
        }
      );

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Scanner start timeout after 10 seconds'));
        }, 10000);
      });

      console.log('Waiting for html5Qrcode.start() to complete...');
      
      try {
        await Promise.race([startPromise, timeoutPromise]);
        console.log('Promise.race completed successfully');
      } catch (timeoutError) {
        console.error('Scanner start timed out or failed:', timeoutError);
        throw timeoutError;
      }

      console.log('html5Qrcode.start() completed successfully!');
      console.log('Scanner is now active and ready to scan QR codes');
      scannerRef.current.html5Qrcode = html5Qrcode;
    } catch (err) {
      console.error('=== ERROR STARTING SCANNER ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(`Failed to start camera: ${err.message}`);
      setIsScanning(false);
      setShowManualInput(true);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.html5Qrcode) {
      try {
        await scannerRef.current.html5Qrcode.stop();
        await scannerRef.current.html5Qrcode.clear();
        scannerRef.current.html5Qrcode = null;
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      console.log('=== MANUAL QR INPUT ===');
      console.log('Manual Input:', manualInput.trim());
      console.log('Calling onScanSuccess with manual data...');
      onScanSuccess(manualInput.trim(), { result: { text: manualInput.trim() } });
      setManualInput('');
      setShowManualInput(false);
    }
  };

  const handleCameraChange = (event) => {
    const selectedCameraId = event.target.value;
    setCameraId(selectedCameraId);
    if (selectedCameraId) {
      stopScanner();
      setTimeout(() => startScanner(selectedCameraId), 500);
    }
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

        {/* Camera Selection */}
        {availableCameras.length > 1 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Camera:
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={cameraId || ''}
              onChange={handleCameraChange}
              SelectProps={{ native: true }}
            >
              {availableCameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </TextField>
          </Box>
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
          {isScanning ? (
            <Box sx={{ textAlign: 'center', zIndex: 2 }}>
              <CircularProgress sx={{ mb: 2, color: 'white' }} />
              <Typography variant="body2" color="white">
                Starting camera...
              </Typography>
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
              <Typography variant="body2" color="white">
                Camera not available
              </Typography>
            </Box>
          )}

          {/* QR Scanner Overlay */}
          <div
            id="qr-scanner"
            ref={scannerRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1
            }}
          />

          {/* Scanning Frame Overlay */}
          {isScanning && !showManualInput && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: scanningArea.width,
                height: scanningArea.height,
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
            onClick={() => {
              stopScanner();
              setTimeout(() => startScanner(), 100);
            }}
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
              onClick={() => {
                stopScanner();
                setTimeout(() => startScanner(), 100);
              }}
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
