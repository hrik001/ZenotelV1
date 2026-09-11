import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { repository } from '../../lib/repository';
import { Organization, Property, UnitStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Building } from 'lucide-react';

export function NewUnitPage() {
  const navigate = useNavigate();
  const { activeOrg, properties } = useOutletContext<{ activeOrg: Organization, properties: Property[] }>();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    property_id: properties[0]?.id || '',
    name: '',
    unit_type: 'Standard Room',
    capacity: 2,
    status: 'Available' as UnitStatus,
    active: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await repository.createUnit({
        ...formData,
        organization_id: activeOrg.id,
        capacity: Number(formData.capacity)
      });
      navigate('/units');
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  if (properties.length === 0) {
    return <div className="p-8">Please create a property first.</div>;
  }

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
            Add New Unit / Room
          </h1>
          <p className="text-stone-500 mt-1">Create a new unit for your property.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Property <span className="text-red-500">*</span></label>
              <select
                required
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="" disabled>Select a property</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Unit Name / Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 101 or Ocean View Suite"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Unit Type <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  name="unit_type"
                  value={formData.unit_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Standard Room"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Capacity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="1"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Initial Status</label>
                <select
                  name="status"
                  value={formData.status}
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
                {loading ? 'Creating...' : 'Create Unit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
