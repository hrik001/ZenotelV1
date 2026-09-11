import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Organization, Property } from '../../types';
import { repository } from '../../lib/repository';

export function usePropertiesData() {
  const { activeOrg, properties: initialProperties } = useOutletContext<{
    activeOrg: Organization,
    properties: Property[],
    activePropertyId: string
  }>();

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [isLoading, setIsLoading] = useState(true);
  const [unitCounts, setUnitCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // We get properties from context, but we might want fresh data
        const freshProperties = await repository.getProperties(activeOrg.id);
        setProperties(freshProperties);
        
        // Load unit counts for each property
        const counts: Record<string, number> = {};
        await Promise.all(freshProperties.map(async (p) => {
          const units = await repository.getUnits(p.id);
          counts[p.id] = units.length;
        }));
        
        setUnitCounts(counts);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    load();
  }, [activeOrg.id]);

  return { properties, unitCounts, isLoading, activeOrg };
}
