const passwordPolicy = {
  // Password requirements
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  
  // Common weak passwords to reject
  commonPasswords: [
    'password', 'password123', 'admin', 'admin123', '123456', '123456789',
    'qwerty', 'abc123', 'letmein', 'welcome', 'monkey', 'dragon',
    'master', 'hello', 'login', 'pass', 'pass123', 'user', 'test'
  ],
  
  // Password history (prevent reuse of last 5 passwords)
  historyLimit: 5
};

/**
 * Validate password strength according to policy
 * @param {string} password - Password to validate
 * @param {string} email - User email (to check for email in password)
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @returns {object} - Validation result with isValid and errors
 */
function validatePassword(password, email = '', firstName = '', lastName = '') {
  const errors = [];
  
  // Check minimum length
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  }
  
  // Check maximum length
  if (password.length > passwordPolicy.maxLength) {
    errors.push(`Password must not exceed ${passwordPolicy.maxLength} characters`);
  }
  
  // Check for uppercase letter
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letter
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (passwordPolicy.requireSpecialChars) {
    const specialCharRegex = new RegExp(`[${passwordPolicy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${passwordPolicy.specialChars})`);
    }
  }
  
  // Check for common passwords
  const lowerPassword = password.toLowerCase();
  if (passwordPolicy.commonPasswords.some(common => common.toLowerCase() === lowerPassword)) {
    errors.push('Password is too common. Please choose a more secure password');
  }
  
  // Check for email in password
  if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
    errors.push('Password cannot contain your email address');
  }
  
  // Check for name in password
  if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
    errors.push('Password cannot contain your first name');
  }
  
  if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
    errors.push('Password cannot contain your last name');
  }
  
  // Check for sequential characters
  if (hasSequentialChars(password)) {
    errors.push('Password cannot contain sequential characters (e.g., abc, 123)');
  }
  
  // Check for repeated characters
  if (hasRepeatedChars(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculatePasswordStrength(password)
  };
}

/**
 * Check for sequential characters
 * @param {string} password 
 * @returns {boolean}
 */
function hasSequentialChars(password) {
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  
  for (let i = 0; i < password.length - 2; i++) {
    const substr = password.toLowerCase().substring(i, i + 3);
    for (const seq of sequences) {
      if (seq.includes(substr)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check for repeated characters
 * @param {string} password 
 * @returns {boolean}
 */
function hasRepeatedChars(password) {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate password strength score
 * @param {string} password 
 * @returns {object}
 */
function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = [];
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;
  
  // Bonus for longer passwords
  if (password.length > 20) score += 1;
  
  // Determine strength level
  let strength = 'Very Weak';
  if (score >= 6) strength = 'Very Strong';
  else if (score >= 5) strength = 'Strong';
  else if (score >= 4) strength = 'Medium';
  else if (score >= 3) strength = 'Weak';
  
  // Generate feedback
  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/\d/.test(password)) feedback.push('Add numbers');
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) feedback.push('Add special characters');
  
  return {
    score: score,
    maxScore: 7,
    strength: strength,
    feedback: feedback
  };
}

/**
 * Express middleware to validate password policy
 */
function validatePasswordPolicy(req, res, next) {
  const { password, email, first_name, last_name } = req.body;
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
      errors: ['Password field is required']
    });
  }
  
  const validation = validatePassword(password, email, first_name, last_name);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Password does not meet security requirements',
      errors: validation.errors,
      strength: validation.strength
    });
  }
  
  // Add password strength info to request
  req.passwordStrength = validation.strength;
  next();
}

/**
 * Get password policy requirements for frontend
 */
function getPasswordPolicy() {
  return {
    minLength: passwordPolicy.minLength,
    maxLength: passwordPolicy.maxLength,
    requireUppercase: passwordPolicy.requireUppercase,
    requireLowercase: passwordPolicy.requireLowercase,
    requireNumbers: passwordPolicy.requireNumbers,
    requireSpecialChars: passwordPolicy.requireSpecialChars,
    specialChars: passwordPolicy.specialChars,
    requirements: [
      `At least ${passwordPolicy.minLength} characters`,
      'At least one uppercase letter (A-Z)',
      'At least one lowercase letter (a-z)',
      'At least one number (0-9)',
      `At least one special character (${passwordPolicy.specialChars})`,
      'Cannot contain your name or email',
      'Cannot be a common password',
      'Cannot contain sequential characters',
      'Cannot contain more than 2 consecutive identical characters'
    ]
  };
}

module.exports = {
  validatePassword,
  validatePasswordPolicy,
  getPasswordPolicy,
  passwordPolicy
};
