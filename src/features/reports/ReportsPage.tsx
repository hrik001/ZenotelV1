import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useOutletContext } from 'react-router-dom';
import { Organization } from '../../types';
import { BarChart3 } from 'lucide-react';

export function ReportsPage() {
  const { activeOrg } = useOutletContext<{ activeOrg: Organization }>();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-stone-500 mt-1">Key performance metrics for {activeOrg?.name || 'your portfolio'}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gross Revenue (YTD)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4 flex flex-col items-center justify-center text-center">
             <BarChart3 className="w-12 h-12 text-stone-300 mb-4" />
             <h3 className="text-lg font-medium text-stone-900">Not enough data yet</h3>
             <p className="text-stone-500 max-w-xs mt-1">As you start receiving payments and bookings, your revenue charts will appear here.</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Occupancy Rate (%)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4 flex flex-col items-center justify-center text-center">
             <BarChart3 className="w-12 h-12 text-stone-300 mb-4" />
             <h3 className="text-lg font-medium text-stone-900">Not enough data yet</h3>
             <p className="text-stone-500 max-w-xs mt-1">Your occupancy rate trends will be visualized here once you have active unit bookings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
