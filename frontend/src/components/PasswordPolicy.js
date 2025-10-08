import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import axios from 'axios';

const PasswordPolicy = ({ password, onStrengthChange, showPolicy = true }) => {
  const [policy, setPolicy] = useState(null);
  const [strength, setStrength] = useState({ score: 0, strength: 'Very Weak' });
  const [validations, setValidations] = useState({});

  useEffect(() => {
    fetchPasswordPolicy();
  }, []);

  useEffect(() => {
    if (password && policy) {
      validatePassword(password);
    }
  }, [password, policy]);

  const fetchPasswordPolicy = async () => {
    try {
      console.log('🔍 Fetching password policy...');
      const response = await axios.get('/api/auth/password-policy');
      console.log('✅ Password policy fetched:', response.data);
      setPolicy(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching password policy:', error);
    }
  };

  const validatePassword = (pwd) => {
    console.log('🔍 Validating password:', pwd ? '***' : 'empty', 'Policy:', policy ? 'loaded' : 'not loaded');
    
    if (!pwd || !policy) {
      // Initialize with empty validations if no password
      const emptyValidations = {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special: false,
        noSequential: false,
        noRepeated: false,
        noCommon: false
      };
      console.log('📝 Setting empty validations:', emptyValidations);
      setValidations(emptyValidations);
      return;
    }

    const validations = {
      length: pwd.length >= policy.minLength && pwd.length <= policy.maxLength,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: new RegExp(`[${policy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(pwd),
      noSequential: !hasSequentialChars(pwd),
      noRepeated: !hasRepeatedChars(pwd),
      noCommon: !isCommonPassword(pwd)
    };

    console.log('✅ Password validations:', validations);
    setValidations(validations);

    // Calculate strength
    const score = Object.values(validations).filter(Boolean).length;
    const strengthLevels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const strengthLevel = strengthLevels[Math.min(score, strengthLevels.length - 1)];

    const strengthData = {
      score: score,
      maxScore: Object.keys(validations).length,
      strength: strengthLevel,
      percentage: (score / Object.keys(validations).length) * 100
    };

    setStrength(strengthData);
    onStrengthChange && onStrengthChange(strengthData);
  };

  const hasSequentialChars = (pwd) => {
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    for (let i = 0; i < pwd.length - 2; i++) {
      const substr = pwd.toLowerCase().substring(i, i + 3);
      for (const seq of sequences) {
        if (seq.includes(substr)) return true;
      }
    }
    return false;
  };

  const hasRepeatedChars = (pwd) => {
    for (let i = 0; i < pwd.length - 2; i++) {
      if (pwd[i] === pwd[i + 1] && pwd[i + 1] === pwd[i + 2]) return true;
    }
    return false;
  };

  const isCommonPassword = (pwd) => {
    const common = ['password', 'password123', 'admin', 'admin123', '123456', 'qwerty', 'abc123'];
    return common.includes(pwd.toLowerCase());
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Very Weak': return '#f44336';
      case 'Weak': return '#ff9800';
      case 'Medium': return '#ffc107';
      case 'Strong': return '#4caf50';
      case 'Very Strong': return '#2e7d32';
      default: return '#f44336';
    }
  };

  if (!policy) return null;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Password Strength Indicator */}
      {password && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SecurityIcon sx={{ mr: 1, color: getStrengthColor(strength.strength) }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Password Strength: {strength.strength}
            </Typography>
            <Chip 
              label={`${Math.round(strength.percentage)}%`}
              size="small"
              sx={{ 
                ml: 1, 
                backgroundColor: getStrengthColor(strength.strength),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={strength.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStrengthColor(strength.strength),
                borderRadius: 4
              }
            }}
          />
        </Paper>
      )}

      {/* Password Requirements */}
      {showPolicy && (
        <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LockIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="h6" fontWeight="bold">
              Password Requirements
            </Typography>
          </Box>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                {validations.length ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText 
                primary={`At least ${policy.minLength} characters (max ${policy.maxLength})`}
                secondary={password && !validations.length ? `Current: ${password.length} characters` : ''}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.uppercase ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary="At least one uppercase letter (A-Z)" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.lowercase ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary="At least one lowercase letter (a-z)" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.numbers ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary="At least one number (0-9)" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.special ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary={`At least one special character (${policy.specialChars})`} />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.noSequential ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary="Cannot contain sequential characters (abc, 123, qwe)" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.noRepeated ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary="Cannot contain more than 2 consecutive identical characters" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {validations.noCommon ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
              </ListItemIcon>
              <ListItemText primary="Cannot be a common password" />
            </ListItem>
          </List>

          {password && Object.values(validations).every(Boolean) && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                ✅ Password meets all security requirements!
              </Typography>
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PasswordPolicy;
