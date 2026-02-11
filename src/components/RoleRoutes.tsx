import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

interface DashboardRouteProps {
  children: React.ReactNode;
}

export const DashboardRoute: React.FC<DashboardRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['state_chairman', 'district_chairman', 'nagar_panchayat_chairman', 'village_sarpanch', 'team_member']}>
      {children}
    </ProtectedRoute>
  );
};

interface CitizenRouteProps {
  children: React.ReactNode;
}

export const CitizenRoute: React.FC<CitizenRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      {children}
    </ProtectedRoute>
  );
};

interface AuthorityRouteProps {
  children: React.ReactNode;
}

export const AuthorityRoute: React.FC<AuthorityRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['state_chairman']}>
      {children}
    </ProtectedRoute>
  );
};
