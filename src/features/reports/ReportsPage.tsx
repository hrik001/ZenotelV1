import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useOutletContext } from 'react-router-dom';
import { Organization } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockRevenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 7200 },
];

const mockOccupancyData = [
  { name: 'Jan', rate: 65 },
  { name: 'Feb', rate: 59 },
  { name: 'Mar', rate: 80 },
  { name: 'Apr', rate: 81 },
  { name: 'May', rate: 86 },
  { name: 'Jun', rate: 92 },
];

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
          <CardContent className="flex-1 min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#78716c' }} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f5f5f4' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Occupancy Rate (%)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOccupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#78716c' }} 
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}%`, 'Occupancy']}
                />
                <Line type="monotone" dataKey="rate" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
