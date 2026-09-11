import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Calendar, CreditCard, Mail, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { useBookingDetailData } from './useBookingDetailData';
import { formatCurrency } from '../../lib/utils';
import { formatDate } from '../../lib/formatters';
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

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { booking, isLoading, error, activeOrg } = useBookingDetailData(id);

  if (isLoading) {
    return <div className="p-8 text-stone-500 text-center animate-pulse">Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold text-stone-900">Couldn't load booking</h2>
        <p className="text-stone-500">The booking may have been deleted or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/bookings')}>Back to Bookings</Button>
      </div>
    );
  }

  const nights = Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24));
  const balance = booking.total_amount - booking.paid_amount;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/bookings')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Booking {booking.id.substring(0, 6).toUpperCase()}
              </h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-stone-500 mt-1">{booking.property?.name}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {booking.status === 'Pending' && <Button variant="outline">Confirm</Button>}
          {booking.status === 'Confirmed' && <Button variant="secondary">Check-in</Button>}
          {booking.status === 'Checked In' && <Button variant="secondary">Check-out</Button>}
          <Button variant="outline">Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-stone-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-stone-400" />
                Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-sm text-stone-500 font-medium">Check-in</p>
                  <p className="text-stone-900 mt-1">{formatDate(booking.check_in, 'EEEE, MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">Check-out</p>
                  <p className="text-stone-900 mt-1">{formatDate(booking.check_out, 'EEEE, MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">Unit</p>
                  <p className="text-stone-900 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    {booking.unit?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">Guests</p>
                  <p className="text-stone-900 mt-1">{booking.guests_count} {booking.guests_count === 1 ? 'Guest' : 'Guests'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3 border-b border-stone-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-stone-400" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-stone-900">{booking.guest?.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {booking.guest?.email && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <a href={`mailto:${booking.guest.email}`} className="hover:text-teal-600 transition-colors">{booking.guest.email}</a>
                      </div>
                    )}
                    {booking.guest?.phone && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <a href={`tel:${booking.guest.phone}`} className="hover:text-teal-600 transition-colors">{booking.guest.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-stone-100 bg-stone-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-stone-400" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 space-y-3 border-b border-stone-100">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Accommodation ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                  <span className="text-stone-900 font-medium">{formatCurrency(booking.base_amount, activeOrg.default_currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Taxes</span>
                  <span className="text-stone-900 font-medium">{formatCurrency(booking.tax_amount, activeOrg.default_currency)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t border-stone-100">
                  <span className="text-stone-900">Total</span>
                  <span className="text-stone-900">{formatCurrency(booking.total_amount, activeOrg.default_currency)}</span>
                </div>
              </div>
              
              <div className="p-6 bg-stone-50/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-500">Amount Paid</span>
                  <span className="text-stone-900 font-medium">{formatCurrency(booking.paid_amount, activeOrg.default_currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className={balance > 0 ? 'text-orange-700' : 'text-green-700'}>
                    {balance > 0 ? 'Balance Due' : 'Fully Paid'}
                  </span>
                  <span className={balance > 0 ? 'text-orange-700' : 'text-green-700'}>
                    {formatCurrency(Math.max(0, balance), activeOrg.default_currency)}
                  </span>
                </div>
                
                {balance > 0 && (
                  <Button className="w-full mt-4">Record Payment</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {booking.payments.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b border-stone-100">
                <CardTitle className="text-base">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-stone-100">
                {booking.payments.map(payment => (
                  <div key={payment.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{formatCurrency(payment.amount, activeOrg.default_currency)}</p>
                      <p className="text-xs text-stone-500">{formatDate(payment.date, 'MMM d, yyyy')} • {payment.method}</p>
                    </div>
                    <Badge variant={payment.status === 'Paid' ? 'success' : 'secondary'} className="text-[10px] px-2 py-0">
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
