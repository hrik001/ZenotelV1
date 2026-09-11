import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Booking, Guest, Organization } from '../../types';
import { repository } from '../../lib/repository';

export interface EnrichedGuest extends Guest {
  totalBookings: number;
  totalSpent: number;
  lastStay?: string;
}

export function useGuestsData() {
  const { activeOrg } = useOutletContext<{
    activeOrg: Organization;
  }>();

  const [guests, setGuests] = useState<EnrichedGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [fetchedGuests, fetchedBookings] = await Promise.all([
          repository.getGuests(activeOrg.id),
          repository.getBookings(activeOrg.id)
        ]);

        const enriched = fetchedGuests.map(guest => {
          const guestBookings = fetchedBookings.filter(b => b.guest_id === guest.id);
          
          const totalSpent = guestBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          
          // Find most recent booking
          let lastStay: string | undefined;
          if (guestBookings.length > 0) {
            lastStay = guestBookings.sort((a, b) => 
              new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
            )[0].check_in;
          }

          return {
            ...guest,
            totalBookings: guestBookings.length,
            totalSpent,
            lastStay
          };
        });

        // Sort by most recent stay or name
        enriched.sort((a, b) => {
          if (a.lastStay && b.lastStay) {
            return new Date(b.lastStay).getTime() - new Date(a.lastStay).getTime();
          }
          if (a.lastStay) return -1;
          if (b.lastStay) return 1;
          return a.name.localeCompare(b.name);
        });

        setGuests(enriched);
      } catch (err) {
        console.error("Failed to load guests", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id]);

  return { guests, isLoading };
}
