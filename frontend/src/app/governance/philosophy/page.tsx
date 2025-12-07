'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { GovernancePhilosophy } from '@/lib/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Alert from '@/components/common/Alert';

export default function PhilosophyPage() {
  const [philosophies, setPhilosophies] = useState<GovernancePhilosophy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState<'org' | 'business_domain' | 'line_of_business' | 'model'>('org');
  const [scopeRef, setScopeRef] = useState('enterprise');
  const [useLLM, setUseLLM] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedPhilosophy, setExpandedPhilosophy] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    risk_appetite: '',
    fairness_and_unfair_discrimination_principles: '',
    external_data_and_vendor_controls: '',
    regulatory_alignment_principles: '',
    safety_and_customer_protection_principles: '',
    explainability_and_customer_communication: '',
    auditability_and_DOI_exam_readiness: '',
    lifecycle_governance: '',
  });

  useEffect(() => {
    loadPhilosophies();
  }, []);

  const loadPhilosophies = async () => {
    try {
      const data = await api.philosophy.list();
      setPhilosophies(data);

      // Load enterprise philosophy if exists
      const enterprise = data.find(p => p.scope === 'org' && p.scope_ref === 'enterprise');
      if (enterprise) {
        setFormData({
          risk_appetite: enterprise.risk_appetite,
          fairness_and_unfair_discrimination_principles: enterprise.fairness_and_unfair_discrimination_principles,
          external_data_and_vendor_controls: enterprise.external_data_and_vendor_controls,
          regulatory_alignment_principles: enterprise.regulatory_alignment_principles,
          safety_and_customer_protection_principles: enterprise.safety_and_customer_protection_principles,
          explainability_and_customer_communication: enterprise.explainability_and_customer_communication,
          auditability_and_DOI_exam_readiness: enterprise.auditability_and_DOI_exam_readiness,
          lifecycle_governance: enterprise.lifecycle_governance,
        });
      }
    } catch (error) {
      console.error('Error loading philosophies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.philosophy.create({
        scope: selectedScope,
        scope_ref: scopeRef,
        ...formData,
        generated_by_llm: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, useLLM);

      setMessage({ type: 'success', text: useLLM ? 'Philosophy saved with AI assistance!' : 'Philosophy saved successfully!' });
      await loadPhilosophies();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save philosophy' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading governance philosophy..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Governance Philosophy</h1>
        <p className="mt-2 text-gray-600">
          Define AI governance principles for your insurance operations
        </p>
      </div>

      {message && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      {/* Existing Philosophies */}
      {philosophies.length > 0 && (
        <Card title={`Existing Philosophies (${philosophies.length})`} className="mb-6">
          <div className="space-y-2 text-sm">
            {philosophies.map((phil, idx) => {
              const philKey = `${phil.scope}_${phil.scope_ref}`;
              const isExpanded = expandedPhilosophy === philKey;

              return (
                <div key={idx} className="border-b last:border-0">
                  <div
                    className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedPhilosophy(isExpanded ? null : philKey)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                      <span className="font-medium">{phil.scope}:</span>
                      <span>{phil.scope_ref}</span>
                      {phil.generated_by_llm && (
                        <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">(AI-generated)</span>
                      )}
                    </div>
                    <span className="text-gray-500">{new Date(phil.created_at).toLocaleDateString()}</span>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 pb-4 space-y-3 bg-gray-50 rounded-b">
                      {phil.risk_appetite && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Risk Appetite</div>
                          <div className="text-gray-600 text-sm">{phil.risk_appetite}</div>
                        </div>
                      )}
                      {phil.fairness_and_unfair_discrimination_principles && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Fairness & Unfair Discrimination Principles</div>
                          <div className="text-gray-600 text-sm">{phil.fairness_and_unfair_discrimination_principles}</div>
                        </div>
                      )}
                      {phil.external_data_and_vendor_controls && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">External Data & Vendor Controls</div>
                          <div className="text-gray-600 text-sm">{phil.external_data_and_vendor_controls}</div>
                        </div>
                      )}
                      {phil.regulatory_alignment_principles && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Regulatory Alignment Principles</div>
                          <div className="text-gray-600 text-sm">{phil.regulatory_alignment_principles}</div>
                        </div>
                      )}
                      {phil.safety_and_customer_protection_principles && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Safety & Customer Protection Principles</div>
                          <div className="text-gray-600 text-sm">{phil.safety_and_customer_protection_principles}</div>
                        </div>
                      )}
                      {phil.explainability_and_customer_communication && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Explainability & Customer Communication</div>
                          <div className="text-gray-600 text-sm">{phil.explainability_and_customer_communication}</div>
                        </div>
                      )}
                      {phil.auditability_and_DOI_exam_readiness && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Auditability & DOI Exam Readiness</div>
                          <div className="text-gray-600 text-sm">{phil.auditability_and_DOI_exam_readiness}</div>
                        </div>
                      )}
                      {phil.lifecycle_governance && (
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Lifecycle Governance</div>
                          <div className="text-gray-600 text-sm">{phil.lifecycle_governance}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Philosophy Form */}
      <form onSubmit={handleSubmit}>
        <Card title="Create or Update Philosophy" className="mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Scope</label>
                <select
                  className="input"
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value as any)}
                >
                  <option value="org">Organization</option>
                  <option value="business_domain">Business Domain</option>
                  <option value="line_of_business">Line of Business</option>
                  <option value="model">Model</option>
                </select>
              </div>

              <div>
                <label className="label">Scope Reference</label>
                <input
                  type="text"
                  className="input"
                  value={scopeRef}
                  onChange={(e) => setScopeRef(e.target.value)}
                  placeholder="e.g., enterprise, P&C_Commercial, Personal Auto"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="use-llm"
                checked={useLLM}
                onChange={(e) => setUseLLM(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="use-llm" className="ml-2 text-sm text-gray-700">
                Use AI to complete missing sections (GPT-3.5-turbo)
              </label>
            </div>
          </div>
        </Card>

        {/* Philosophy Sections */}
        <div className="space-y-6">
          {[
            { key: 'risk_appetite', label: 'Risk Appetite' },
            { key: 'fairness_and_unfair_discrimination_principles', label: 'Fairness & Unfair Discrimination Principles' },
            { key: 'external_data_and_vendor_controls', label: 'External Data & Vendor Controls' },
            { key: 'regulatory_alignment_principles', label: 'Regulatory Alignment Principles' },
            { key: 'safety_and_customer_protection_principles', label: 'Safety & Customer Protection Principles' },
            { key: 'explainability_and_customer_communication', label: 'Explainability & Customer Communication' },
            { key: 'auditability_and_DOI_exam_readiness', label: 'Auditability & DOI Exam Readiness' },
            { key: 'lifecycle_governance', label: 'Lifecycle Governance' },
          ].map(({ key, label }) => (
            <Card key={key} title={label}>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                value={formData[key as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                placeholder={`Enter ${label.toLowerCase()} guidance...${useLLM ? ' (leave empty for AI to generate)' : ''}`}
              />
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Philosophy'}
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <Card title="About Governance Philosophy" className="mt-6">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            Governance philosophy documents define your organization's approach to AI governance
            in insurance operations. Key areas include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Risk appetite for AI in pricing, underwriting, and claims</li>
            <li>Principles for preventing unfair discrimination</li>
            <li>Controls for external data sources and vendors</li>
            <li>Alignment with NAIC AI Principles and state DOI requirements</li>
            <li>Customer protection and safety measures</li>
            <li>Explainability standards for consumer communication</li>
            <li>Audit readiness for market conduct examinations</li>
            <li>AI lifecycle governance (development to retirement)</li>
          </ul>
          <p className="mt-3 text-primary-600">
            Enable AI assistance to automatically generate guidance based on insurance best practices
            and regulatory requirements.
          </p>
        </div>
      </Card>
    </div>
  );
}
