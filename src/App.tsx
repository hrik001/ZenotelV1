/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from './features/auth/Login';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './features/overview/OverviewPage';
import { BookingsPage } from './features/bookings/BookingsPage';
import { BookingDetailPage } from './features/bookings/BookingDetailPage';
import { NewBookingPage } from './features/bookings/NewBookingPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { PropertiesPage } from './features/properties/PropertiesPage';
import { NewPropertyPage } from './features/properties/NewPropertyPage';
import { PropertyDetailPage } from './features/properties/PropertyDetailPage';
import { UnitsPage } from './features/units/UnitsPage';
import { NewUnitPage } from './features/units/NewUnitPage';
import { UnitDetailPage } from './features/units/UnitDetailPage';
import { GuestsPage } from './features/guests/GuestsPage';
import { PaymentsPage } from './features/payments/PaymentsPage';

import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { TeamPage } from './features/team/TeamPage';

// Placeholder pages for operational routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
    <p className="text-stone-500 mt-2">This feature is under development.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingFlow />} />
          
          <Route element={<AppShell />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            
            {/* Bookings */}
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/new" element={<NewBookingPage />} />
            <Route path="/bookings/:id" element={<BookingDetailPage />} />

            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/guests/new" element={<PlaceholderPage title="Add Guest" />} />
            <Route path="/guests/:id" element={<PlaceholderPage title="Guest Profile" />} />
            
            {/* Portfolio Management */}
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/new" element={<NewPropertyPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/units/new" element={<NewUnitPage />} />
            <Route path="/units/:id" element={<UnitDetailPage />} />
            
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/team" element={<TeamPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
