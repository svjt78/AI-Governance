'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ControlCatalogEntry } from '@/lib/types';
import Card from '@/components/common/Card';
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

export default function ControlDetailPage() {
  const params = useParams();
  const router = useRouter();
  const controlIdParam = Array.isArray(params.control_id) ? params.control_id[0] : params.control_id;
  const controlId = controlIdParam ? decodeURIComponent(controlIdParam) : '';

  const [control, setControl] = useState<ControlCatalogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    framework_reference: '',
    regulatory_focus: '',
    category: CONTROL_CATEGORIES[0],
    accountability: ACCOUNTABILITY_OPTIONS[0],
    description: '',
    mandatory_for_prod: false,
    applies_to_use_case_categories: '',
  });

  useEffect(() => {
    if (!controlId) return;
    loadControl();
  }, [controlId]);

  const loadControl = async () => {
    try {
      const data = await api.controls.get(controlId);
      setControl(data);
      setFormData({
        framework_reference: data.framework_reference,
        regulatory_focus: data.regulatory_focus,
        category: data.category,
        accountability: data.accountability,
        description: data.description,
        mandatory_for_prod: data.mandatory_for_prod,
        applies_to_use_case_categories: data.applies_to_use_case_categories.join(', '),
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load control details' });
    } finally {
      setLoading(false);
    }
  };

  const parseUseCases = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!controlId) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      framework_reference: formData.framework_reference.trim(),
      regulatory_focus: formData.regulatory_focus.trim(),
      category: formData.category,
      accountability: formData.accountability,
      description: formData.description.trim(),
      mandatory_for_prod: formData.mandatory_for_prod,
      applies_to_use_case_categories: parseUseCases(formData.applies_to_use_case_categories),
    };

    try {
      await api.controls.update(controlId, payload);
      setMessage({ type: 'success', text: `Updated control ${controlId}` });
      await loadControl();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update control' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!controlId) return;
    const confirmed = window.confirm(`Delete control ${controlId}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.controls.delete(controlId);
      router.push('/controls');
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to delete control ${controlId}` });
    }
  };

  if (loading) return <Loading message="Loading control..." />;

  if (!control) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Control Not Found</h1>
        <p className="mt-2 text-gray-600">Return to the controls list to select another control.</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push('/controls')}>Back to Controls</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Control</h1>
        <p className="mt-2 text-gray-600">Update details for {control.control_id}.</p>
        <div className="mt-3">
          <Link href="/controls" className="text-sm text-primary-600 hover:text-primary-700">
            Back to Control List
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <Card title={`Control ${control.control_id}`} actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push('/controls')}>Back</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      }>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Control ID</label>
              <input className="input" value={control.control_id} disabled />
            </div>
            <div>
              <label className="label">Regulatory Focus</label>
              <input
                className="input"
                value={formData.regulatory_focus}
                onChange={(e) => setFormData({ ...formData, regulatory_focus: e.target.value })}
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

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
