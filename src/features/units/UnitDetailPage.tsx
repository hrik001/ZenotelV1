import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { repository } from '../../lib/repository';
import { Organization, Property, Unit, UnitStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Building } from 'lucide-react';

export function UnitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useOutletContext<{ activeOrg: Organization, properties: Property[] }>();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState<Partial<Unit> | null>(null);

  useEffect(() => {
    const loadUnit = async () => {
      if (!id) return;
      try {
        // Find property logic: we fetch units across all properties accessible to user
        // But since we don't have a direct getUnit API, let's fetch units for all properties and find it
        // Or we could add a specific getUnit endpoint. 
        // For now, we will fetch units for the first property, or if activePropertyId is set.
        // Actually, AppShell can fetch all units or we just fetch from backend if we can.
        
        // As a shortcut, if we are in this component, we can just fetch all units for org if we added an orgId param to getUnits.
        // Let's modify the backend to get a specific unit, or we just fetch the unit from the list.
        // For now, since repository doesn't have getUnitById, we will just fetch units for all properties the user has access to.
        
        let allUnits: Unit[] = [];
        for (const p of properties) {
          const res = await repository.getUnits(p.id);
          allUnits = [...allUnits, ...res];
        }
        
        const unit = allUnits.find(u => u.id === id);
        if (unit) {
          setFormData(unit);
        } else {
          setErrorMsg('Unit not found.');
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUnit();
  }, [id, properties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      await repository.updateUnit(id, {
        ...formData,
        capacity: Number(formData.capacity)
      });
      navigate('/units');
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!formData && !errorMsg) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate('/units')}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-stone-400" />
            Edit Unit / Room
          </h1>
          <p className="text-stone-500 mt-1">Update unit details.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {errorMsg}
        </div>
      )}

      {formData && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Property</label>
                <select
                  disabled
                  value={formData.property_id || ''}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 text-stone-500 cursor-not-allowed"
                >
                  <option value={formData.property_id}>
                    {properties.find(p => p.id === formData.property_id)?.name || 'Unknown Property'}
                  </option>
                </select>
                <p className="text-xs text-stone-400">Property cannot be changed after creation.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Unit Name / Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Unit Type <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="unit_type"
                    value={formData.unit_type || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Capacity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    name="capacity"
                    value={formData.capacity || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'Available'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/units')} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
