import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Guest, Organization, Property, Unit } from '../../types';
import { repository } from '../../lib/repository';

export function useBookingFormData() {
  const { activeOrg, properties, activePropertyId } = useOutletContext<{
    activeOrg: Organization,
    properties: Property[],
    activePropertyId: string
  }>();

  const [units, setUnits] = useState<Unit[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // If a specific property is selected in the global switcher, use it as default.
  // Otherwise, use the first property available.
  const defaultPropertyId = activePropertyId !== 'all' ? activePropertyId : (properties[0]?.id || '');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const fetchedGuests = await repository.getGuests(activeOrg.id);
        setGuests(fetchedGuests);
        
        if (defaultPropertyId) {
          const fetchedUnits = await repository.getUnits(defaultPropertyId);
          setUnits(fetchedUnits);
        }
      } catch (err) {
        console.error("Failed to load booking form references", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [activeOrg.id, defaultPropertyId]);

  // Expose a helper to fetch units if the user changes the property in the form
  const loadUnitsForProperty = async (propertyId: string) => {
    try {
      const fetchedUnits = await repository.getUnits(propertyId);
      setUnits(fetchedUnits);
    } catch (err) {
      console.error("Failed to load units for property", err);
    }
  };

  return {
    properties,
    units,
    guests,
    defaultPropertyId,
    activeOrg,
    isLoading,
    loadUnitsForProperty
  };
}
