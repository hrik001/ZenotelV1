import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnitsData } from './useUnitsData';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Loader2, Plus } from 'lucide-react';
import { UnitStatus } from '../../types';

function UnitStatusBadge({ status }: { status: UnitStatus }) {
  switch (status) {
    case 'Available': return <Badge variant="success">{status}</Badge>;
    case 'Occupied': return <Badge variant="info">{status}</Badge>;
    case 'Maintenance': return <Badge variant="warning">{status}</Badge>;
    case 'Inactive': return <Badge variant="secondary">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export function UnitsPage() {
  const { units, isLoading, activePropertyId } = useUnitsData();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Units & Rooms</h1>
          <p className="text-stone-500 mt-1">Manage your accommodation inventory.</p>
        </div>
        <Button onClick={() => navigate('/units/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-stone-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input className="pl-9" placeholder="Search rooms..." />
          </div>
        </div>
        
        <CardContent className="flex-1 overflow-auto p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading units...
            </div>
          ) : units.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-lg font-medium text-stone-900">No units found</h3>
              <p className="text-stone-500 mt-1 mb-4 max-w-sm">
                {activePropertyId !== 'all' 
                  ? "This property doesn't have any units yet." 
                  : "You haven't added any units to your properties yet."}
              </p>
              <Button onClick={() => navigate('/units/new')}>Add your first unit</Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-stone-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id} className="cursor-pointer" onClick={() => navigate(`/units/${unit.id}`)}>
                    <TableCell className="font-medium text-stone-900">
                      {unit.name}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {unit.unit_type}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {unit.capacity} {unit.capacity === 1 ? 'Person' : 'People'}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {unit.property?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <UnitStatusBadge status={unit.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
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
