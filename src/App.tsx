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
import { UnitsPage } from './features/units/UnitsPage';
import { GuestsPage } from './features/guests/GuestsPage';
import { PaymentsPage } from './features/payments/PaymentsPage';

import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';

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
            <Route path="/properties/new" element={<PlaceholderPage title="Add Property" />} />
            <Route path="/properties/:id" element={<PlaceholderPage title="Property Details" />} />
            
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/units/new" element={<PlaceholderPage title="Add Unit" />} />
            <Route path="/units/:id" element={<PlaceholderPage title="Unit Details" />} />
            
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
