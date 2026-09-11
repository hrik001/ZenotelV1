import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertiesData } from './usePropertiesData';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loader2, Plus, MapPin } from 'lucide-react';

export function PropertiesPage() {
  const { properties, unitCounts, isLoading } = usePropertiesData();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Properties</h1>
          <p className="text-stone-500 mt-1">Manage your portfolio of hospitality businesses.</p>
        </div>
        <Button onClick={() => navigate('/properties/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 overflow-auto p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-lg font-medium text-stone-900">No properties found</h3>
              <p className="text-stone-500 mt-1 mb-4">Add your first property to get started.</p>
              <Button onClick={() => navigate('/properties/new')}>Add Property</Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-stone-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} className="cursor-pointer" onClick={() => navigate(`/properties/${property.id}`)}>
                    <TableCell className="font-medium text-stone-900">
                      {property.name}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {property.property_type}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        {property.city}, {property.country}
                      </div>
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {unitCounts[property.id] || 0}
                    </TableCell>
                    <TableCell>
                      {property.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
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
