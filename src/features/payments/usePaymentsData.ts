import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Booking, Organization, Payment, Property } from '../../types';
import { repository } from '../../lib/repository';

export interface EnrichedPayment extends Payment {
  booking?: Booking;
  property?: Property;
}

export function usePaymentsData() {
  const { activeOrg, properties, activePropertyId } = useOutletContext<{
    activeOrg: Organization;
    properties: Property[];
    activePropertyId: string;
  }>();

  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [fetchedPayments, fetchedBookings] = await Promise.all([
          repository.getPayments(activeOrg.id),
          repository.getBookings(activeOrg.id)
        ]);

        let enriched = fetchedPayments.map(payment => {
          const booking = fetchedBookings.find(b => b.id === payment.booking_id);
          const property = properties.find(p => p.id === booking?.property_id);
          
          return {
            ...payment,
            booking,
            property
          };
        });

        // Filter by property if one is selected globally
        if (activePropertyId !== 'all') {
          enriched = enriched.filter(p => p.booking?.property_id === activePropertyId);
        }

        // Sort by date descending (most recent first)
        enriched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setPayments(enriched);
      } catch (err) {
        console.error("Failed to load payments", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id, activePropertyId, properties]);

  return { payments, isLoading };
}
