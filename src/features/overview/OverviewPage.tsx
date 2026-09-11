import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Organization, Property, Booking } from '../../types';
import { repository } from '../../lib/repository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowRight, PlaneLanding, PlaneTakeoff, Users, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export function OverviewPage() {
  const { activeOrg, properties, activePropertyId } = useOutletContext<{
    activeOrg: Organization,
    properties: Property[],
    activePropertyId: string
  }>();

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const load = async () => {
      const propId = activePropertyId === 'all' ? undefined : activePropertyId;
      const bks = await repository.getBookings(activeOrg.id, propId);
      setBookings(bks);
    };
    load();
  }, [activeOrg.id, activePropertyId]);

  const activePropName = activePropertyId === 'all' 
    ? 'All properties' 
    : properties.find(p => p.id === activePropertyId)?.name || 'Unknown Property';

  // Derived stats (simulated)
  const arrivalsToday = 3;
  const departuresToday = 1;
  const inHouse = 12;
  const occupancy = "68%";
  const outstanding = 4500;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Today</h1>
          <p className="text-stone-500 mt-1">Here's what needs your attention for {activePropName}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Check-in Guest</Button>
          <Button>New Booking</Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <PlaneLanding className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Arrivals</span>
            </div>
            <div className="text-3xl font-bold text-stone-900">{arrivalsToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <PlaneTakeoff className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Departures</span>
            </div>
            <div className="text-3xl font-bold text-stone-900">{departuresToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">In-house</span>
            </div>
            <div className="text-3xl font-bold text-stone-900">{inHouse}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Occupancy</span>
            </div>
            <div className="text-3xl font-bold text-stone-900">{occupancy}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Outstanding</span>
            </div>
            <div className="text-xl font-bold text-orange-900">{formatCurrency(outstanding, activeOrg.default_currency)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Arrivals & Departures lists */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-stone-100 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Today's Arrivals</CardTitle>
                <Button variant="ghost" size="sm" className="text-teal-700">View all <ArrowRight className="ml-1 w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {bookings.slice(0, 3).map(b => (
                    <div key={b.id} className="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-900">Booking {b.id.substring(0,6)}</p>
                        <p className="text-sm text-stone-500">Unit: {b.unit_id.substring(0,4)} • {b.guests_count} Guests</p>
                      </div>
                      <Button variant="outline" size="sm">Check-in</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-stone-500">
                  <p>No arrivals scheduled for today.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attention required */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-md bg-stone-50 border border-stone-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">2 bookings have outstanding balances</p>
                    <p className="text-xs text-stone-500 mt-0.5">Collect payment before check-out.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-md bg-stone-50 border border-stone-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">3 arrivals missing details</p>
                    <p className="text-xs text-stone-500 mt-0.5">Missing phone numbers or ID documents.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
