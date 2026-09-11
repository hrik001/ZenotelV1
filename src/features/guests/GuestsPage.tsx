import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestsData } from './useGuestsData';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Loader2, Plus, Mail, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

export function GuestsPage() {
  const { guests, isLoading } = useGuestsData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGuests = useMemo(() => {
    if (!searchTerm.trim()) return guests;
    const lowerSearch = searchTerm.toLowerCase();
    return guests.filter(g => 
      g.name.toLowerCase().includes(lowerSearch) || 
      (g.email && g.email.toLowerCase().includes(lowerSearch)) ||
      (g.phone && g.phone.toLowerCase().includes(lowerSearch))
    );
  }, [guests, searchTerm]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Guests</h1>
          <p className="text-stone-500 mt-1">Manage guest profiles and lifetime value.</p>
        </div>
        <Button onClick={() => navigate('/guests/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-stone-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input 
              className="pl-9" 
              placeholder="Search guests by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <CardContent className="flex-1 overflow-auto p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading guests...
            </div>
          ) : guests.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-lg font-medium text-stone-900">No guests found</h3>
              <p className="text-stone-500 mt-1 mb-4">You haven't added any guests yet.</p>
              <Button onClick={() => navigate('/guests/new')}>Add your first guest</Button>
            </div>
          ) : filteredGuests.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-lg font-medium text-stone-900">No matching guests</h3>
              <p className="text-stone-500 mt-1 mb-4">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-stone-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Stay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id} className="cursor-pointer hover:bg-stone-50" onClick={() => navigate(`/guests/${guest.id}`)}>
                    <TableCell className="font-medium text-stone-900">
                      {guest.name}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      <div className="flex flex-col space-y-1 text-sm">
                        {guest.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{guest.email}</span>
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{guest.phone}</span>
                          </div>
                        )}
                        {!guest.email && !guest.phone && (
                          <span className="text-stone-400 italic">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {guest.totalBookings}
                    </TableCell>
                    <TableCell className="text-stone-900 font-medium">
                      {formatCurrency(guest.totalSpent)}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {guest.lastStay ? formatDate(guest.lastStay) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
