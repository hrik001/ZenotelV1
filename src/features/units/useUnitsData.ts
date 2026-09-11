import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Organization, Property, Unit } from '../../types';
import { repository } from '../../lib/repository';

export interface EnrichedUnit extends Unit {
  property?: Property;
}

export function useUnitsData() {
  const { activeOrg, properties, activePropertyId } = useOutletContext<{
    activeOrg: Organization,
    properties: Property[],
    activePropertyId: string
  }>();

  const [units, setUnits] = useState<EnrichedUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        let fetchedUnits: Unit[] = [];
        
        if (activePropertyId !== 'all') {
          fetchedUnits = await repository.getUnits(activePropertyId);
        } else {
          // Fetch units for all properties concurrently
          const unitPromises = properties.map(p => repository.getUnits(p.id));
          const results = await Promise.all(unitPromises);
          fetchedUnits = results.flat();
        }

        const enriched = fetchedUnits.map(unit => ({
          ...unit,
          property: properties.find(p => p.id === unit.property_id)
        }));

        // Sort by property name, then unit name
        enriched.sort((a, b) => {
          const propA = a.property?.name || '';
          const propB = b.property?.name || '';
          if (propA !== propB) return propA.localeCompare(propB);
          return a.name.localeCompare(b.name);
        });

        setUnits(enriched);
      } catch (err) {
        console.error("Failed to load units", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id, activePropertyId, properties]);

  return { units, isLoading, properties, activeOrg, activePropertyId };
}
