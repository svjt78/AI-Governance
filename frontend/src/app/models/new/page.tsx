'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function NewModelPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    version: '1.0.0',
    model_type: 'regressor' as const,
    business_domain: 'P&C_Personal' as const,
    line_of_business: 'Personal Auto' as const,
    use_case_category: 'Pricing' as const,
    detailed_use_case: '',
    owner_team: '',
    product_or_program: '',
    jurisdictions: [] as string[],
    deployment_environment: 'dev' as const,
    deployment_details: {},
    external_data_sources: [] as string[],
    governance_status: 'draft' as const,
  });

  const [jurisdictionInput, setJurisdictionInput] = useState('');
  const [externalDataInput, setExternalDataInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const newModel = await api.models.create(formData);
      router.push(`/models/${newModel.model_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create model');
      setSaving(false);
    }
  };

  const addJurisdiction = () => {
    if (jurisdictionInput && !formData.jurisdictions.includes(jurisdictionInput)) {
      setFormData({
        ...formData,
        jurisdictions: [...formData.jurisdictions, jurisdictionInput],
      });
      setJurisdictionInput('');
    }
  };

  const removeJurisdiction = (jurisdiction: string) => {
    setFormData({
      ...formData,
      jurisdictions: formData.jurisdictions.filter(j => j !== jurisdiction),
    });
  };

  const addExternalData = () => {
    if (externalDataInput && !formData.external_data_sources.includes(externalDataInput)) {
      setFormData({
        ...formData,
        external_data_sources: [...formData.external_data_sources, externalDataInput],
      });
      setExternalDataInput('');
    }
  };

  const removeExternalData = (source: string) => {
    setFormData({
      ...formData,
      external_data_sources: formData.external_data_sources.filter(s => s !== source),
    });
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/models" className="text-sm text-primary-600 hover:text-primary-800 mb-2 inline-block">
          ← Back to Models
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Register New AI Model</h1>
        <p className="mt-2 text-gray-600">
          Add a new insurance AI model to your governance registry
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Model Name *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Personal Auto Pricing Model"
                />
              </div>

              <div>
                <label className="label">Version *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="label">Model Type *</label>
                <select
                  className="input"
                  value={formData.model_type}
                  onChange={(e) => setFormData({ ...formData, model_type: e.target.value as any })}
                >
                  <option value="regressor">Regressor</option>
                  <option value="classifier">Classifier</option>
                  <option value="llm">LLM</option>
                  <option value="rag">RAG</option>
                  <option value="agent">Agent</option>
                  <option value="rules_plus_model">Rules + Model</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Insurance Context */}
          <Card title="Insurance Context">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Business Domain *</label>
                <select
                  className="input"
                  value={formData.business_domain}
                  onChange={(e) => setFormData({ ...formData, business_domain: e.target.value as any })}
                >
                  <option value="P&C_Personal">P&C Personal</option>
                  <option value="P&C_Commercial">P&C Commercial</option>
                  <option value="Reinsurance">Reinsurance</option>
                  <option value="Specialty">Specialty</option>
                </select>
              </div>

              <div>
                <label className="label">Line of Business *</label>
                <select
                  className="input"
                  value={formData.line_of_business}
                  onChange={(e) => setFormData({ ...formData, line_of_business: e.target.value as any })}
                >
                  <option value="Personal Auto">Personal Auto</option>
                  <option value="Homeowners">Homeowners</option>
                  <option value="Commercial Auto">Commercial Auto</option>
                  <option value="Workers_Compensation">Workers Compensation</option>
                  <option value="Property">Property</option>
                  <option value="GL">GL</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Use Case Category *</label>
                <select
                  className="input"
                  value={formData.use_case_category}
                  onChange={(e) => setFormData({ ...formData, use_case_category: e.target.value as any })}
                >
                  <option value="Pricing">Pricing</option>
                  <option value="Underwriting">Underwriting</option>
                  <option value="Claims">Claims</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Customer_Service">Customer Service</option>
                  <option value="Operational_Copilot">Operational Copilot</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Detailed Use Case *</label>
                <textarea
                  className="input"
                  rows={3}
                  required
                  value={formData.detailed_use_case}
                  onChange={(e) => setFormData({ ...formData, detailed_use_case: e.target.value })}
                  placeholder="Describe the specific insurance use case and decision-making context..."
                />
              </div>
            </div>
          </Card>

          {/* Ownership */}
          <Card title="Ownership & Program">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Owner Team *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.owner_team}
                  onChange={(e) => setFormData({ ...formData, owner_team: e.target.value })}
                  placeholder="e.g., Personal_Lines_Analytics"
                />
              </div>

              <div>
                <label className="label">Product/Program *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.product_or_program}
                  onChange={(e) => setFormData({ ...formData, product_or_program: e.target.value })}
                  placeholder="e.g., DirectAuto_Personal"
                />
              </div>
            </div>
          </Card>

          {/* Jurisdictions */}
          <Card title="Jurisdictions">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={jurisdictionInput}
                  onChange={(e) => setJurisdictionInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJurisdiction())}
                  placeholder="Enter state code (e.g., CA, NY, TX)"
                />
                <Button type="button" onClick={addJurisdiction}>Add</Button>
              </div>
              {formData.jurisdictions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {jurisdiction}
                      <button
                        type="button"
                        onClick={() => removeJurisdiction(jurisdiction)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* External Data Sources */}
          <Card title="External Data Sources">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={externalDataInput}
                  onChange={(e) => setExternalDataInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExternalData())}
                  placeholder="e.g., credit_based_insurance_score, telematics_score"
                />
                <Button type="button" onClick={addExternalData}>Add</Button>
              </div>
              {formData.external_data_sources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.external_data_sources.map((source) => (
                    <span
                      key={source}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      {source}
                      <button
                        type="button"
                        onClick={() => removeExternalData(source)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Deployment */}
          <Card title="Deployment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Environment *</label>
                <select
                  className="input"
                  value={formData.deployment_environment}
                  onChange={(e) => setFormData({ ...formData, deployment_environment: e.target.value as any })}
                >
                  <option value="dev">Development</option>
                  <option value="test">Test</option>
                  <option value="prod">Production</option>
                </select>
              </div>

              <div>
                <label className="label">Governance Status *</label>
                <select
                  className="input"
                  value={formData.governance_status}
                  onChange={(e) => setFormData({ ...formData, governance_status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved_for_prod">Approved for Prod</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end space-x-4">
          <Link href="/models">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Register Model'}
          </Button>
        </div>
      </form>
    </div>
  );
}
