import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Organization, Property } from '../../types';
import { repository } from '../../lib/repository';

export function useReportsData() {
  const { activeOrg, activePropertyId } = useOutletContext<{
    activeOrg: Organization;
    activePropertyId: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{name: string, value: number}[]>([]);
  const [occupancyData, setOccupancyData] = useState<{name: string, value: number}[]>([]);
  
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0 });

  useEffect(() => {
    const load = async () => {
      if (!activeOrg) return;
      setIsLoading(true);
      try {
        const [payments, bookings] = await Promise.all([
          repository.getPayments(activeOrg.id),
          repository.getBookings(activeOrg.id, activePropertyId !== 'all' ? activePropertyId : undefined)
        ]);

        // Revenue by month
        const revMap: Record<string, number> = {};
        let totalRev = 0;
        
        let filteredPayments = payments;
        if (activePropertyId !== 'all') {
           const validBookingIds = new Set(bookings.map(b => b.id));
           filteredPayments = payments.filter(p => validBookingIds.has(p.booking_id));
        }

        filteredPayments.forEach(p => {
           if (p.status === 'Paid') {
              const d = new Date(p.date);
              const m = d.toLocaleString('default', { month: 'short' });
              revMap[m] = (revMap[m] || 0) + Number(p.amount);
              totalRev += Number(p.amount);
           }
        });
        
        const revArr = Object.keys(revMap).map(k => ({ name: k, value: revMap[k] }));
        
        setRevenueData(revArr.length ? revArr : [{name: 'No Data', value: 0}]);
        setStats({ totalRevenue: totalRev, totalBookings: bookings.length });

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg, activePropertyId]);

  return { isLoading, revenueData, occupancyData, stats };
}
