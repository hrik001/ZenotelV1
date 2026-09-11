import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ArrowLeft } from 'lucide-react';
import { useBookingFormData } from './useBookingFormData';
import { repository } from '../../lib/repository';
import { calculateNights } from '../../lib/financials';

const bookingSchema = z.object({
  property_id: z.string().min(1, 'Property is required'),
  unit_id: z.string().min(1, 'Unit is required'),
  guest_id: z.string().min(1, 'Guest is required'),
  check_in: z.string().min(1, 'Check-in date is required'),
  check_out: z.string().min(1, 'Check-out date is required'),
  guests_count: z.union([z.string(), z.number()]).transform(Number).refine(val => val >= 1, 'At least 1 guest required'),
  base_amount: z.union([z.string(), z.number()]).transform(Number).refine(val => val >= 0, 'Amount must be positive'),
  tax_amount: z.union([z.string(), z.number()]).transform(Number).refine(val => val >= 0, 'Tax must be positive'),
}).refine(data => new Date(data.check_out) > new Date(data.check_in), {
  message: "Check-out must be after check-in",
  path: ["check_out"]
});

type BookingFormValues = z.input<typeof bookingSchema>;

export function NewBookingPage() {
  const navigate = useNavigate();
  const { properties, units, guests, defaultPropertyId, activeOrg, loadUnitsForProperty, isLoading } = useBookingFormData();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      property_id: defaultPropertyId,
      unit_id: '',
      guest_id: '',
      check_in: new Date().toISOString().split('T')[0],
      check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests_count: 1,
      base_amount: 0,
      tax_amount: 0,
    }
  });

  const selectedPropertyId = watch('property_id');
  const checkIn = watch('check_in');
  const checkOut = watch('check_out');
  const baseAmount = watch('base_amount');
  const taxAmount = watch('tax_amount');

  // Reload units if property changes
  useEffect(() => {
    if (selectedPropertyId) {
      loadUnitsForProperty(selectedPropertyId);
      // Reset unit selection when property changes
      setValue('unit_id', '');
    }
  }, [selectedPropertyId]);

  const onSubmit = async (data: z.output<typeof bookingSchema>) => {
    setIsSubmitting(true);
    try {
      const booking = await repository.createBooking({
        organization_id: activeOrg.id,
        property_id: data.property_id,
        unit_id: data.unit_id,
        guest_id: data.guest_id,
        check_in: data.check_in,
        check_out: data.check_out,
        guests_count: data.guests_count,
        status: 'Confirmed',
        base_amount: data.base_amount,
        tax_amount: data.tax_amount,
        total_amount: data.base_amount + data.tax_amount,
        paid_amount: 0, // No payment recorded initially in this flow
      });
      
      navigate(`/bookings/${booking.id}`);
    } catch (error) {
      console.error("Failed to create booking", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-stone-500 text-center animate-pulse">Loading form details...</div>;
  }

  const nights = calculateNights(checkIn, checkOut);
  const total = (Number(baseAmount) || 0) + (Number(taxAmount) || 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate('/bookings')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">New Booking</h1>
          <p className="text-stone-500">Create a new stay for a guest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-3 border-b border-stone-100">
            <CardTitle className="text-lg">Stay Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_id">Property</Label>
                <select
                  id="property_id"
                  className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
                  {...register('property_id')}
                >
                  <option value="" disabled>Select a property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.property_id && <p className="text-sm text-red-600">{errors.property_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_id">Unit / Room</Label>
                <select
                  id="unit_id"
                  className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
                  disabled={!selectedPropertyId || units.length === 0}
                  {...register('unit_id')}
                >
                  <option value="" disabled>Select a unit</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.unit_type})</option>
                  ))}
                </select>
                {errors.unit_id && <p className="text-sm text-red-600">{errors.unit_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check-in Date</Label>
                <Input
                  id="check_in"
                  type="date"
                  error={!!errors.check_in}
                  {...register('check_in')}
                />
                {errors.check_in && <p className="text-sm text-red-600">{errors.check_in.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out">Check-out Date</Label>
                <Input
                  id="check_out"
                  type="date"
                  error={!!errors.check_out}
                  {...register('check_out')}
                />
                {errors.check_out && <p className="text-sm text-red-600">{errors.check_out.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests_count">Number of Guests</Label>
                <Input
                  id="guests_count"
                  type="number"
                  min="1"
                  error={!!errors.guests_count}
                  {...register('guests_count')}
                />
                {errors.guests_count && <p className="text-sm text-red-600">{errors.guests_count.message}</p>}
              </div>
            </div>
            {nights > 0 && (
              <p className="text-sm font-medium text-stone-500 text-right">
                Duration: {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-stone-100">
            <CardTitle className="text-lg">Guest Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="guest_id">Primary Guest</Label>
              <div className="flex gap-2">
                <select
                  id="guest_id"
                  className="flex h-10 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  {...register('guest_id')}
                >
                  <option value="" disabled>Select an existing guest</option>
                  {guests.map(g => (
                    <option key={g.id} value={g.id}>{g.name} {g.email ? `(${g.email})` : ''}</option>
                  ))}
                </select>
                <Button type="button" variant="outline">New Guest</Button>
              </div>
              {errors.guest_id && <p className="text-sm text-red-600">{errors.guest_id.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-stone-100">
            <CardTitle className="text-lg">Financials</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="base_amount">Accommodation Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                  <Input
                    id="base_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7"
                    error={!!errors.base_amount}
                    {...register('base_amount')}
                  />
                </div>
                {errors.base_amount && <p className="text-sm text-red-600">{errors.base_amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_amount">Taxes & Fees</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                  <Input
                    id="tax_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7"
                    error={!!errors.tax_amount}
                    {...register('tax_amount')}
                  />
                </div>
                {errors.tax_amount && <p className="text-sm text-red-600">{errors.tax_amount.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <span className="text-base font-medium text-stone-900">Total Amount</span>
              <span className="text-2xl font-bold text-stone-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/bookings')}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create Booking</Button>
        </div>
      </form>
    </div>
  );
}
