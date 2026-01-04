'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ControlCatalogEntry } from '@/lib/types';
import Card from '@/components/common/Card';
import Link from 'next/link';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import Loading from '@/components/common/Loading';

const CONTROL_CATEGORIES = ['Explainability', 'Data&Bias', 'Compliance', 'Risk', 'Operations'];
const ACCOUNTABILITY_OPTIONS = [
  'Chief Compliance Officer',
  'Chief Risk Officer',
  'Chief Underwriting Officer',
  'Chief Claims Officer',
  'Chief Actuary',
  'Chief Data Officer',
  'Chief Information Security Officer',
  'Chief AI Officer',
  'Chief Privacy Officer',
];

const emptyForm = {
  control_id: '',
  framework_reference: '',
  regulatory_focus: '',
  category: CONTROL_CATEGORIES[0],
  accountability: ACCOUNTABILITY_OPTIONS[0],
  description: '',
  mandatory_for_prod: false,
  applies_to_use_case_categories: '',
};

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    loadControls();
  }, []);

  const loadControls = async () => {
    try {
      const data = await api.controls.list();
      setControls(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load controls catalog' });
    } finally {
      setLoading(false);
    }
  };

  const parseUseCases = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const resetForm = () => {
    setFormData({ ...emptyForm });
  };

  const handleDelete = async (controlId: string) => {
    const confirmed = window.confirm(`Delete control ${controlId}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.controls.delete(controlId);
      setMessage({ type: 'success', text: `Deleted control ${controlId}` });
      await loadControls();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to delete control ${controlId}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      control_id: formData.control_id.trim(),
      framework_reference: formData.framework_reference.trim(),
      regulatory_focus: formData.regulatory_focus.trim(),
      category: formData.category,
      accountability: formData.accountability,
      description: formData.description.trim(),
      mandatory_for_prod: formData.mandatory_for_prod,
      applies_to_use_case_categories: parseUseCases(formData.applies_to_use_case_categories),
    };

    try {
      await api.controls.create(payload);
      setMessage({ type: 'success', text: `Created control ${payload.control_id}` });
      resetForm();
      await loadControls();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to create control',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading controls..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Controls</h1>
        <p className="mt-2 text-gray-600">
          Manage governance controls used for model evaluations and audit readiness.
        </p>
      </div>

      {message && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <Card title={`Controls Catalog (${controls.length})`} className="mb-6">
        {controls.length === 0 ? (
          <p className="text-sm text-gray-500">No controls found. Add your first control below.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Control</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Accountability</th>
                  <th className="py-2 pr-4 font-medium">Applies To</th>
                  <th className="py-2 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {controls.map((control) => (
                  <tr key={control.control_id} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-gray-900">
                        {control.control_id} - {control.regulatory_focus.replace(/_/g, ' ')}
                      </div>
                      <div className="text-gray-600">{control.description}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {control.framework_reference.replace(/_/g, ' ')}
                        {control.mandatory_for_prod && (
                          <span className="ml-2 text-red-600 font-medium">Mandatory for Production</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{control.category}</td>
                    <td className="py-3 pr-4 text-gray-700">{control.accountability}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {control.applies_to_use_case_categories.length === 0 ? (
                          <span className="text-xs text-gray-500">All use cases</span>
                        ) : (
                          control.applies_to_use_case_categories.map((useCase) => (
                            <span
                              key={useCase}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                            >
                              {useCase.replace(/_/g, ' ')}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/controls/${encodeURIComponent(control.control_id)}`}>
                          <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(control.control_id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add New Control">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Control ID</label>
              <input
                className="input"
                value={formData.control_id}
                onChange={(e) => setFormData({ ...formData, control_id: e.target.value })}
                placeholder="NAIC-AI-11"
                required
              />
            </div>
            <div>
              <label className="label">Regulatory Focus</label>
              <input
                className="input"
                value={formData.regulatory_focus}
                onChange={(e) => setFormData({ ...formData, regulatory_focus: e.target.value })}
                placeholder="Consumer_Transparency"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Framework Reference</label>
              <input
                className="input"
                value={formData.framework_reference}
                onChange={(e) => setFormData({ ...formData, framework_reference: e.target.value })}
                placeholder="NAIC_AI_Principles"
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {CONTROL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Accountability</label>
            <select
              className="input"
              value={formData.accountability}
              onChange={(e) => setFormData({ ...formData, accountability: e.target.value })}
              required
            >
              {ACCOUNTABILITY_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and evaluation intent for this control."
              required
            />
          </div>

          <div>
            <label className="label">Applies to Use Case Categories</label>
            <input
              className="input"
              value={formData.applies_to_use_case_categories}
              onChange={(e) => setFormData({ ...formData, applies_to_use_case_categories: e.target.value })}
              placeholder="Pricing, Underwriting, Claims"
            />
            <p className="mt-1 text-xs text-gray-500">Comma-separated. Leave blank to apply to all use cases.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="mandatory_for_prod"
              type="checkbox"
              checked={formData.mandatory_for_prod}
              onChange={(e) => setFormData({ ...formData, mandatory_for_prod: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="mandatory_for_prod" className="text-sm text-gray-700">
              Mandatory for production
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Control'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
