import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useOutletContext } from 'react-router-dom';
import { Organization } from '../../types';
import { BarChart3, Loader2 } from 'lucide-react';
import { useReportsData } from './useReportsData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/formatters';

export function ReportsPage() {
  const { activeOrg } = useOutletContext<{ activeOrg: Organization }>();
  const { isLoading, revenueData, stats } = useReportsData();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-stone-500 mt-1">Key performance metrics for {activeOrg?.name || 'your portfolio'}.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-stone-500">Total Revenue (Paid)</p>
             <p className="text-2xl font-bold text-stone-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6">
             <p className="text-sm font-medium text-stone-500">Total Bookings</p>
             <p className="text-2xl font-bold text-stone-900 mt-2">{stats.totalBookings}</p>
           </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gross Revenue</CardTitle>
            <CardDescription>Paid payments by month</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4 pb-8 pl-0 pr-6">
            {isLoading ? (
               <div className="h-full flex items-center justify-center">
                 <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
               </div>
            ) : revenueData.length > 0 && revenueData[0].name !== 'No Data' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} dy={10} />
                  <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#78716c', fontSize: 12}}
                     tickFormatter={(value) => `$${value}`}
                     dx={-10}
                  />
                  <Tooltip 
                     cursor={{fill: '#f5f5f4'}}
                     contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex-1 min-h-0 h-full flex flex-col items-center justify-center text-center">
                 <BarChart3 className="w-12 h-12 text-stone-300 mb-4" />
                 <h3 className="text-lg font-medium text-stone-900">Not enough data</h3>
                 <p className="text-stone-500 max-w-xs mt-1">As you start receiving payments, your revenue charts will appear here.</p>
               </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for future occupancy chart */}
        <Card className="flex flex-col h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Occupancy Rate (%)</CardTitle>
            <CardDescription>Average unit utilization</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4 flex flex-col items-center justify-center text-center">
             <BarChart3 className="w-12 h-12 text-stone-300 mb-4" />
             <h3 className="text-lg font-medium text-stone-900">Coming soon</h3>
             <p className="text-stone-500 max-w-xs mt-1">Your occupancy rate trends will be visualized here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
