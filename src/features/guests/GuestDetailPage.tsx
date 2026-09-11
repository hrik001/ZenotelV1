import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { repository } from '../../lib/repository';
import { Organization, Guest } from '../../types';
import { Loader2 } from 'lucide-react';

export function GuestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrg } = useOutletContext<{ activeOrg: Organization }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!activeOrg || !id) return;
      setIsLoading(true);
      try {
        const guests = await repository.getGuests(activeOrg.id);
        setGuest(guests.find(g => g.id === id) || null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeOrg, id]);

  const handleArchive = async () => {
    if (!guest || !window.confirm('Archive this guest?')) return;
    try {
      await repository.updateGuest(guest.id, { archived_at: new Date().toISOString() } as any);
      navigate('/guests');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin w-6 h-6 text-stone-400 mx-auto" /></div>;
  if (!guest) return <div className="p-8 text-center text-stone-500">Guest not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-900">Guest Profile</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/guests')}>Back</Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleArchive}>Archive</Button>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>{guest.name}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {guest.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {guest.phone || 'N/A'}</p>
          <p><strong>Notes:</strong> {guest.notes || 'None'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
