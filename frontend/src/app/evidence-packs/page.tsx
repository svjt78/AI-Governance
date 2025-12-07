'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EvidencePack } from '@/lib/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

export default function EvidencePacksPage() {
  const [packs, setPacks] = useState<EvidencePack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const data = await api.evidencePacks.list();
      setPacks(data);
    } catch (error) {
      console.error('Error loading evidence packs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading evidence packs..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Evidence Packs</h1>
        <p className="mt-2 text-gray-600">
          Audit-ready documentation packages for DOI examinations
        </p>
      </div>

      <Card title={`Evidence Packs (${packs.length})`}>
        {packs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No evidence packs generated yet.</p>
            <p className="mt-2 text-sm text-gray-400">
              Generate evidence packs from the model detail pages.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Evidence Pack ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Model ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jurisdictions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {packs.map((pack) => (
                  <tr key={pack.evidence_pack_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {pack.evidence_pack_id}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {pack.model_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {pack.jurisdictions_covered.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(pack.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {pack.created_by}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        size="sm"
                        onClick={() => api.evidencePacks.download(pack.evidence_pack_id)}
                      >
                        Download ZIP
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="About Evidence Packs" className="mt-6">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            Evidence packs contain comprehensive documentation for DOI market conduct examinations,
            including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Model details and insurance context</li>
            <li>Data lineage and training pipeline</li>
            <li>Control catalog and evaluations</li>
            <li>Explainability evaluations</li>
            <li>Bias and unfair discrimination testing</li>
            <li>Drift monitoring results</li>
            <li>RAG evaluations (for copilots)</li>
            <li>Risk assessments</li>
            <li>Governance philosophy</li>
            <li>Audit log summary</li>
          </ul>
          <p className="mt-3">
            All files are packaged as separate markdown documents in a ZIP archive for easy review.
          </p>
        </div>
      </Card>
    </div>
  );
}
