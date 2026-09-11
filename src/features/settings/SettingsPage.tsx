import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useOutletContext } from 'react-router-dom';
import { Organization } from '../../types';

export function SettingsPage() {
  const { activeOrg } = useOutletContext<{ activeOrg: Organization }>();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Organization Settings</h1>
        <p className="text-stone-500 mt-1">Manage global configuration for {activeOrg?.name || 'your business'}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md bg-stone-100 text-stone-900">
            General Info
          </button>
          <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-600 hover:bg-stone-50 hover:text-stone-900">
            Billing & Plans
          </button>
          <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-600 hover:bg-stone-50 hover:text-stone-900">
            Team Members
          </button>
          <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-600 hover:bg-stone-50 hover:text-stone-900">
            Integrations
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-stone-100">
              <CardTitle className="text-lg">Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org_name">Organization Name</Label>
                <Input id="org_name" defaultValue={activeOrg?.name || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select 
                    id="currency" 
                    className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    defaultValue="USD"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select 
                    id="timezone" 
                    className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    defaultValue="UTC"
                  >
                    <option value="UTC">UTC (Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b border-stone-100">
              <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-stone-500 mb-4">
                Permanently delete this organization and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive">Delete Organization</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
