import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingsData } from './useBookingsData';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';
import { formatDate } from '../../lib/formatters';
import { Search, Filter, Loader2, Plus } from 'lucide-react';
import { BookingStatus } from '../../types';

function StatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case 'Confirmed': return <Badge variant="success">{status}</Badge>;
    case 'Pending': return <Badge variant="warning">{status}</Badge>;
    case 'Checked In': return <Badge variant="info">{status}</Badge>;
    case 'Checked Out': return <Badge variant="secondary">{status}</Badge>;
    case 'Cancelled': case 'No Show': return <Badge variant="danger">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export function BookingsPage() {
  const { bookings, isLoading, activeOrg } = useBookingsData();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Bookings</h1>
          <p className="text-stone-500 mt-1">Manage upcoming and past stays across your properties.</p>
        </div>
        <Button onClick={() => navigate('/bookings/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input className="pl-9" placeholder="Search by guest name, booking ID..." />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <CardContent className="flex-1 overflow-auto p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-stone-50 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-900">No bookings found</h3>
              <p className="text-stone-500 mt-1 mb-4 max-w-sm">
                Get started by creating your first booking.
              </p>
              <Button onClick={() => navigate('/bookings/new')}>Create Booking</Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-stone-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow 
                    key={booking.id} 
                    className="cursor-pointer"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    <TableCell className="font-medium text-stone-900">
                      {booking.id.substring(0, 6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <p className="text-stone-900">{booking.guest?.name || 'Unknown'}</p>
                      {booking.guests_count > 1 && (
                        <p className="text-xs text-stone-500">+{booking.guests_count - 1} guests</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-stone-900 truncate max-w-[200px]">{booking.property?.name}</p>
                      <p className="text-xs text-stone-500">{booking.unit?.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-stone-900">{formatDate(booking.check_in, 'MMM d')} - {formatDate(booking.check_out, 'MMM d')}</p>
                      <p className="text-xs text-stone-500">
                        {Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-stone-900 font-medium">
                        {formatCurrency(booking.total_amount, activeOrg.default_currency)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {booking.total_amount - booking.paid_amount > 0 
                          ? `${formatCurrency(booking.total_amount - booking.paid_amount, activeOrg.default_currency)} due`
                          : 'Fully paid'
                        }
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
