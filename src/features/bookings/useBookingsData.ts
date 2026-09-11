import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Booking, Guest, Organization, Property, Unit } from '../../types';
import { repository } from '../../lib/repository';

export interface EnrichedBooking extends Booking {
  guest?: Guest;
  property?: Property;
  unit?: Unit;
}

export function useBookingsData() {
  const { activeOrg, properties, activePropertyId } = useOutletContext<{
    activeOrg: Organization,
    properties: Property[],
    activePropertyId: string
  }>();

  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const propId = activePropertyId === 'all' ? undefined : activePropertyId;
        const bks = await repository.getBookings(activeOrg.id, propId);
        
        // Enrich bookings with guest, property, and unit info
        // (In a real backend, this would often be a JOIN query)
        const guests = await repository.getGuests(activeOrg.id);
        
        const enriched = await Promise.all(bks.map(async (bk) => {
          const guest = guests.find(g => g.id === bk.guest_id);
          const property = properties.find(p => p.id === bk.property_id);
          // Only fetch unit if we need to
          const units = await repository.getUnits(bk.property_id);
          const unit = units.find(u => u.id === bk.unit_id);
          
          return { ...bk, guest, property, unit };
        }));
        
        // Sort by check_in date descending
        enriched.sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());
        setBookings(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id, activePropertyId, properties]);

  return { bookings, isLoading, activeOrg };
}
