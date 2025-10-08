import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Create Auth Context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start - only once
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('AuthContext: Set axios header with token:', token.substring(0, 20) + '...');
        
        try {
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.data,
              token: token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: 'LOGOUT' });
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []); // Run only once on mount

  // Login function
  const login = async (email, password) => {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password);
    
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('=== LOGIN SUCCESS ===');
      console.log('Response:', response.data);
      
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      return { success: true };
    } catch (error) {
      console.log('=== LOGIN ERROR ===');
      console.log('Error:', error);
      console.log('Error response:', error.response);
      console.log('Error message:', error.response?.data?.message);
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.log('Final error message:', errorMessage);
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Check if user has permission for specific module and action
  const hasPermission = (module, action) => {
    if (!state.user) return false;
    
    const permissions = getRolePermissions(state.user.role);
    return permissions[module]?.includes(action) || false;
  };

  // Get user permissions
  const getUserPermissions = () => {
    if (!state.user) return {};
    return getRolePermissions(state.user.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    hasPermission,
    getUserPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role-based permissions configuration
const getRolePermissions = (role) => {
  const permissions = {
    superadmin: {
      users: ['create', 'read', 'update', 'delete'],
      trips: ['create', 'read', 'update', 'delete'],
      finance: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete']
    },
    admin: {
      users: ['read'], // Admin cannot manage users
      trips: ['create', 'read', 'update', 'delete'],
      finance: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete']
    },
    trip_manager: {
      users: [],
      trips: ['create', 'read', 'update', 'delete'],
      finance: [],
      reports: ['read'],
      settings: []
    },
    financial_manager: {
      users: [],
      trips: ['read'], // Read-only access to trips
      finance: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: []
    },
    user: {
      users: [],
      trips: ['read'],
      finance: [],
      reports: [],
      settings: []
    }
  };

  return permissions[role] || {};
};
