'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { InsuranceAIModel } from '@/lib/types';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

export default function ModelsPage() {
  const [models, setModels] = useState<InsuranceAIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    business_domain: '',
    line_of_business: '',
    use_case_category: '',
    governance_status: '',
  });

  useEffect(() => {
    loadModels();
  }, [filters]);

  const loadModels = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const data = await api.models.list(params);
      setModels(data);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading models..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Models</h1>
          <p className="mt-2 text-gray-600">Manage your insurance AI model registry</p>
        </div>
        <Link href="/models/new">
          <Button>Register New Model</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Business Domain</label>
            <select
              className="input text-sm"
              value={filters.business_domain}
              onChange={(e) => setFilters({ ...filters, business_domain: e.target.value })}
            >
              <option value="">All Domains</option>
              <option value="P&C_Personal">P&C Personal</option>
              <option value="P&C_Commercial">P&C Commercial</option>
              <option value="Reinsurance">Reinsurance</option>
              <option value="Specialty">Specialty</option>
            </select>
          </div>

          <div>
            <label className="label">Line of Business</label>
            <select
              className="input text-sm"
              value={filters.line_of_business}
              onChange={(e) => setFilters({ ...filters, line_of_business: e.target.value })}
            >
              <option value="">All Lines</option>
              <option value="Personal Auto">Personal Auto</option>
              <option value="Homeowners">Homeowners</option>
              <option value="Commercial Auto">Commercial Auto</option>
              <option value="Workers_Compensation">Workers Compensation</option>
              <option value="Property">Property</option>
              <option value="GL">GL</option>
            </select>
          </div>

          <div>
            <label className="label">Use Case</label>
            <select
              className="input text-sm"
              value={filters.use_case_category}
              onChange={(e) => setFilters({ ...filters, use_case_category: e.target.value })}
            >
              <option value="">All Use Cases</option>
              <option value="Pricing">Pricing</option>
              <option value="Underwriting">Underwriting</option>
              <option value="Claims">Claims</option>
              <option value="Fraud">Fraud</option>
              <option value="Operational_Copilot">Operational Copilot</option>
            </select>
          </div>

          <div>
            <label className="label">Governance Status</label>
            <select
              className="input text-sm"
              value={filters.governance_status}
              onChange={(e) => setFilters({ ...filters, governance_status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="approved_for_prod">Approved for Prod</option>
              <option value="temporarily_suspended">Suspended</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Models Table */}
      <Card title={`Models (${models.length})`}>
        {models.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No models found matching your filters.</p>
            <Link href="/models/new" className="mt-4 inline-block">
              <Button>Register First Model</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line of Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Use Case</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model.model_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{model.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.version}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.model_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.line_of_business}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.use_case_category}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="default">{model.deployment_environment}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="status" value={model.governance_status}>
                        {model.governance_status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/models/${model.model_id}`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
