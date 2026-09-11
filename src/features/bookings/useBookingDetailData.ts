import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Booking, Guest, Organization, Payment, Property, Unit } from '../../types';
import { repository } from '../../lib/repository';
import { EnrichedBooking } from './useBookingsData';

export interface BookingDetailState extends EnrichedBooking {
  payments: Payment[];
}

export function useBookingDetailData(bookingId?: string) {
  const { activeOrg } = useOutletContext<{ activeOrg: Organization }>();
  
  const [booking, setBooking] = useState<BookingDetailState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real implementation we would fetch by booking ID directly,
        // but here we get all and filter to simulate DB fetch since LocalRepository
        // doesn't have a direct getBookingById yet. We could add it, but this works for demo.
        const bookings = await repository.getBookings(activeOrg.id);
        const bk = bookings.find(b => b.id === bookingId);
        
        if (!bk) {
          throw new Error("Booking not found");
        }

        // Fetch related entities
        const guests = await repository.getGuests(activeOrg.id);
        const guest = guests.find(g => g.id === bk.guest_id);
        
        const properties = await repository.getProperties(activeOrg.id);
        const property = properties.find(p => p.id === bk.property_id);
        
        const units = await repository.getUnits(bk.property_id);
        const unit = units.find(u => u.id === bk.unit_id);
        
        const payments = await repository.getPayments(activeOrg.id, bk.id);

        setBooking({
          ...bk,
          guest,
          property,
          unit,
          payments
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load booking"));
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id, bookingId]);

  return { booking, isLoading, error, activeOrg };
}
