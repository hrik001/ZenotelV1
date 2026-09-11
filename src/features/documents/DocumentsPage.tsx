import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Organization, Property } from '../../types';
import { FileText, Download, Trash2, Upload, Loader2, Key } from 'lucide-react';
import { repository } from '../../lib/repository';
import { useAuth } from '../../context/AuthContext';

export function DocumentsPage() {
  const { activeOrg, activePropertyId } = useOutletContext<{ activeOrg: Organization, activePropertyId: string }>();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!activeOrg || !activePropertyId) return;
      setIsLoading(true);
      try {
        const [docs, members] = await Promise.all([
           repository.getPropertyDocuments?.(activeOrg.id, activePropertyId) || Promise.resolve([]),
           repository.getOrganizationMembers(activeOrg.id)
        ]);
        setDocuments(docs);
        const myMem = members.find(m => m.user_id === user?.id);
        setMembership(myMem);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeOrg, activePropertyId, user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeOrg || !activePropertyId) return;
    
    setIsUploading(true);
    try {
      await repository.uploadPropertyDocument?.(activeOrg.id, activePropertyId, file, 'General', file.name);
      // Reload
      const docs = await repository.getPropertyDocuments?.(activeOrg.id, activePropertyId) || [];
      setDocuments(docs);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (docId: string) => {
    if (!activeOrg || !activePropertyId) return;
    try {
      const res = await repository.downloadPropertyDocument?.(activeOrg.id, activePropertyId, docId);
      if (res?.url) {
        window.open(res.url, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Download failed');
    }
  };

  const canManage = membership?.role === 'Owner' || membership?.role === 'Manager';

  if (!activePropertyId) {
    return (
      <div className="p-8 text-center text-stone-500">
        Please select a property to view documents.
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Property Documents</h1>
          <p className="text-stone-500 mt-1">Manage secure private documents for this property.</p>
        </div>
        
        {canManage && (
          <div>
            <input type="file" id="doc-upload" className="hidden" onChange={handleUpload} />
            <Button onClick={() => document.getElementById('doc-upload')?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload Document
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center text-stone-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
               <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-stone-900">No documents yet</h3>
               <p className="text-stone-500 mt-1">Upload leases, licenses, or property policies here.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-stone-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-stone-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{doc.label}</p>
                      <p className="text-xs text-stone-500">{(doc.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
