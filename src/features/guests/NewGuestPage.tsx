import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { repository } from '../../lib/repository';
import { Organization } from '../../types';

export function NewGuestPage() {
  const navigate = useNavigate();
  const { activeOrg } = useOutletContext<{ activeOrg: Organization }>();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    try {
      await repository.createGuest({ ...formData, organization_id: activeOrg.id });
      navigate('/guests');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Add New Guest</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm mb-1 text-stone-700">Name</label><input required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="block text-sm mb-1 text-stone-700">Email</label><input type="email" className="w-full border rounded p-2" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
            <div><label className="block text-sm mb-1 text-stone-700">Phone</label><input type="tel" pattern="^\\+?[0-9\\s\\-\\(\\)]{7,15}$" title="Please enter a valid phone number" className="w-full border rounded p-2" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div><label className="block text-sm mb-1 text-stone-700">Notes</label><textarea className="w-full border rounded p-2" rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => navigate('/guests')}>Cancel</Button><Button type="submit">Save Guest</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
