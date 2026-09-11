import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { repository } from '../../lib/repository';
import { Organization, OrganizationMember, Property, Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Users, UserPlus, Trash2, Edit2, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';

export function TeamPage() {
  const { activeOrg, properties } = useOutletContext<{ activeOrg: Organization, properties: Property[] }>();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<OrganizationMember | null>(null);
  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repository.updateOrganizationMember || !showEditModal) return;
    try {
      setErrorMsg('');
      await repository.updateOrganizationMember(activeOrg.id, showEditModal.id, { 
        role: inviteRole, 
        property_ids: inviteRole === 'Owner' ? [] : inviteProperties 
      });
      setShowEditModal(null);
      loadMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const openEditModal = (member: OrganizationMember) => {
    setInviteRole(member.role);
    setInviteProperties(member.property_ids || []);
    setShowEditModal(member);
  };
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Staff');
  const [inviteProperties, setInviteProperties] = useState<string[]>([]);
  
  useEffect(() => {
    loadMembers();
  }, [activeOrg]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await repository.getOrganizationMembers(activeOrg.id);
      setMembers(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repository.inviteOrganizationMember) return;
    try {
      setErrorMsg('');
      await repository.inviteOrganizationMember(activeOrg.id, inviteEmail, inviteRole, inviteRole === 'Owner' ? [] : inviteProperties);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteProperties([]);
      setInviteRole('Staff');
      loadMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleRemove = async (id: string) => {
    if (!repository.updateOrganizationMember) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      setErrorMsg('');
      await repository.updateOrganizationMember(activeOrg.id, id, { status: 'Removed' });
      loadMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const activeMembers = members.filter(m => m.status !== 'Removed');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Team Management</h1>
          <p className="text-stone-500 mt-1">Manage users, roles, and property access.</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-stone-500">Loading team members...</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Property Access</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {activeMembers.map(member => (
                <tr key={member.id} className="hover:bg-stone-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                        {member.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{member.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-stone-500">{member.user?.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {member.role === 'Owner' && <Key className="w-3.5 h-3.5 text-amber-500" />}
                      <span className={`font-medium ${
                        member.role === 'Owner' ? 'text-amber-700' :
                        member.role === 'Manager' ? 'text-blue-700' : 'text-stone-700'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {member.role === 'Owner' ? (
                      <span className="text-stone-400 italic">All Properties</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {member.property_ids?.length > 0 ? (
                          member.property_ids.map(pid => {
                            const p = properties.find(x => x.id === pid);
                            return <span key={pid}>{p?.name || 'Unknown Property'}</span>;
                          })
                        ) : (
                          <span className="text-red-400 italic">No access</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(member)} className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors" title="Edit Role/Access">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors" 
                        title="Remove Member"
                        disabled={member.role === 'Owner' && activeMembers.filter(m => m.role === 'Owner').length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {(showInviteModal || showEditModal) && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-xl border-stone-200">
            <CardHeader>
              <CardTitle>{showEditModal ? 'Edit Team Member' : 'Invite Team Member'}</CardTitle>
              <CardDescription>
                {showEditModal ? 'Update role and property access.' : 'For this MVP, the user must already have signed into the app once (created an account). Enter their exact email.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={showEditModal ? handleEdit : handleInvite} className="space-y-4">
                {!showEditModal && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="colleague@example.com"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>

                {inviteRole !== 'Owner' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700">Property Access</label>
                    <div className="border border-stone-200 rounded-md p-2 space-y-2 max-h-48 overflow-y-auto">
                      {properties.map(p => (
                        <label key={p.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inviteProperties.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInviteProperties([...inviteProperties, p.id]);
                              } else {
                                setInviteProperties(inviteProperties.filter(id => id !== p.id));
                              }
                            }}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-stone-700">{p.name}</span>
                        </label>
                      ))}
                      {properties.length === 0 && (
                        <p className="text-xs text-stone-500 p-2">No properties available.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setShowInviteModal(false); setShowEditModal(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {showEditModal ? 'Save Changes' : 'Send Invite'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
