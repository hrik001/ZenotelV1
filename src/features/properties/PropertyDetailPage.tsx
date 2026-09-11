import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { repository } from '../../lib/repository';
import { Organization, Property, BusinessType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ArrowLeft, Building2 } from 'lucide-react';

export function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrg, properties } = useOutletContext<{ activeOrg: Organization, properties: Property[] }>();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState<Partial<Property> | null>(null);

  useEffect(() => {
    const prop = properties.find(p => p.id === id);
    if (prop) {
      setFormData(prop);
    } else {
      // If it's not in the context (maybe they don't have access or it doesn't exist)
      setErrorMsg('Property not found or you do not have access.');
    }
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
      await repository.updateProperty(activeOrg.id, id, formData);
      window.location.href = '/properties';
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  if (!formData && !errorMsg) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate('/properties')}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-stone-400" />
            Edit Property
          </h1>
          <p className="text-stone-500 mt-1">Update property details.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Property Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Property Type</label>
                  <select
                    name="property_type"
                    value={formData.property_type || 'Hotel'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Resort">Resort</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Guesthouse">Guesthouse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">State / Region <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Country</label>
                  <input
                    type="text"
                    required
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/properties')} disabled={loading}>
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
