import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Booking, Organization, Property, Unit } from '../../types';
import { repository } from '../../lib/repository';

export interface CalendarDay {
  date: string;
  isToday: boolean;
}

export function useCalendarData() {
  const { activeOrg, properties, activePropertyId } = useOutletContext<{
    activeOrg: Organization,
    properties: Property[],
    activePropertyId: string
  }>();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default to a 14-day view starting from today
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d;
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const propId = activePropertyId === 'all' ? undefined : activePropertyId;
        const bks = await repository.getBookings(activeOrg.id, propId);
        setBookings(bks);

        if (propId) {
          const u = await repository.getUnits(propId);
          setUnits(u);
        } else if (properties.length > 0) {
          // If all properties, just load the first one's units for the demo
          // In reality, we'd group units by property on the calendar
          const u = await repository.getUnits(properties[0].id);
          setUnits(u);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id, activePropertyId, properties]);

  // Generate date range
  const days: CalendarDay[] = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = d.getTime() === today.getTime();

    return {
      date: d.toISOString().split('T')[0],
      isToday,
    };
  });

  const nextWeek = () => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + 7);
    setStartDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(startDate);
    prev.setDate(prev.getDate() - 7);
    setStartDate(prev);
  };

  const today = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setStartDate(t);
  };

  return { 
    bookings, 
    units, 
    isLoading, 
    days,
    nextWeek,
    prevWeek,
    today,
    startDate
  };
}
