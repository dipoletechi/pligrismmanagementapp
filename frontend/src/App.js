import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import Destinations from './components/MasterData/Destinations';
import Amenities from './components/MasterData/Amenities';
import FoodManagement from './components/MasterData/FoodManagement';
import Drivers from './components/Transport/Drivers';
import Buses from './components/Transport/Buses';
import AccommodationVendors from './components/Vendors/AccommodationVendors';
import FoodVendors from './components/Vendors/FoodVendors';
import TransportVendors from './components/Vendors/TransportVendors';
import SupportTickets from './components/Support/SupportTickets';
import TripList from './components/Trip/TripList';
import CreateTrip from './components/Trip/CreateTrip';
import TripTracking from './components/Trip/TripTracking';
import './App.css';

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes with Layout */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* User Management - Superadmin only */}
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin']}>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Master Data Routes */}
              <Route 
                path="/master-data/destinations" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <Destinations />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/master-data/amenities" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <Amenities />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/master-data/food" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <FoodManagement />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              
              {/* Transport Management Routes */}
              <Route 
                path="/transport/drivers" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <Drivers />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/transport/buses" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <Buses />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Vendors Management Routes */}
              <Route 
                path="/vendors/accommodation" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <AccommodationVendors />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/vendors/food" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <FoodVendors />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/vendors/transport" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <TransportVendors />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Trip Management - Admin, Trip Manager, Financial Manager, User */}
              <Route 
                path="/trips" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user']}
                  >
                    <MainLayout>
                      <TripList />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/trips/create" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['superadmin', 'admin', 'trip_manager']}
                  >
                    <MainLayout>
                      <CreateTrip />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/trips/list" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user']}
                  >
                    <MainLayout>
                      <TripList />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/trips/tracking" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user']}
                  >
                    <MainLayout>
                      <TripTracking />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Support Management - Superadmin, Admin */}
              <Route 
                path="/support" 
                element={
                  <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                    <MainLayout>
                      <SupportTickets />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trips" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['admin', 'trip_manager', 'financial_manager', 'user']}
                    requiredPermissions={[{ module: 'trips', action: 'read' }]}
                  >
                    <MainLayout>
                      <div>Trip Management - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Financial Management - Admin, Financial Manager */}
              <Route 
                path="/finance" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['admin', 'financial_manager']}
                    requiredPermissions={[{ module: 'finance', action: 'read' }]}
                  >
                    <MainLayout>
                      <div>Financial Management - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Reports - Admin, Trip Manager, Financial Manager */}
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['admin', 'trip_manager', 'financial_manager']}
                    requiredPermissions={[{ module: 'reports', action: 'read' }]}
                  >
                    <MainLayout>
                      <div>Reports - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Settings - Admin, Superadmin */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute 
                    requiredRoles={['admin', 'superadmin']}
                    requiredPermissions={[{ module: 'settings', action: 'read' }]}
                  >
                    <MainLayout>
                      <div>Settings - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
