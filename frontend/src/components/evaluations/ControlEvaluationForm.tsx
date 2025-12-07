import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { ControlCatalogEntry } from '@/lib/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

interface ControlEvaluationFormProps {
  modelId: string;
  onSuccess: () => void;
}

export default function ControlEvaluationForm({ modelId, onSuccess }: ControlEvaluationFormProps) {
  const [controls, setControls] = useState<ControlCatalogEntry[]>([]);
  const [loadingControls, setLoadingControls] = useState(true);
  const [selectedControl, setSelectedControl] = useState<ControlCatalogEntry | null>(null);

  const [formData, setFormData] = useState({
    control_id: '',
    status: 'passed',
    rationale: '',
    evidence_links: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadControls();
  }, []);

  const loadControls = async () => {
    try {
      const controlsData = await api.controls.list();
      setControls(controlsData);
    } catch (error) {
      console.error('Error loading controls:', error);
      setMessage({ type: 'error', text: 'Failed to load controls catalog' });
    } finally {
      setLoadingControls(false);
    }
  };

  const handleControlChange = (controlId: string) => {
    const control = controls.find(c => c.control_id === controlId);
    setSelectedControl(control || null);
    setFormData({ ...formData, control_id: controlId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const evidenceLinksArray = formData.evidence_links
        ? formData.evidence_links.split('\n').filter(link => link.trim())
        : [];

      await api.controls.createEvaluations(modelId, [{
        model_id: modelId,
        control_id: formData.control_id,
        status: formData.status as 'passed' | 'failed' | 'not_applicable' | 'needs_review',
        rationale: formData.rationale,
        evidence_links: evidenceLinksArray,
        last_updated: new Date().toISOString(),
      }]);

      setMessage({ type: 'success', text: 'Control evaluation submitted successfully!' });

      // Reset form
      setFormData({
        control_id: '',
        status: 'passed',
        rationale: '',
        evidence_links: '',
      });
      setSelectedControl(null);

      // Notify parent to refresh
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit control evaluation' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingControls) {
    return (
      <Card title="Add Control Evaluation">
        <p className="text-sm text-gray-500">Loading controls...</p>
      </Card>
    );
  }

  return (
    <Card title="Add Control Evaluation">
      {message && (
        <div className="mb-4">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Control</label>
          <select
            className="input"
            value={formData.control_id}
            onChange={(e) => handleControlChange(e.target.value)}
            required
          >
            <option value="">Select a control...</option>
            {controls.map((control) => (
              <option key={control.control_id} value={control.control_id}>
                {control.control_id} - {control.regulatory_focus.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {selectedControl && (
          <div className="p-3 bg-gray-50 rounded-md text-sm">
            <p className="font-medium text-gray-900 mb-1">{selectedControl.regulatory_focus.replace(/_/g, ' ')}</p>
            <p className="text-gray-700 mb-2">{selectedControl.description}</p>
            <div className="flex gap-4 text-xs text-gray-600">
              <span><strong>Framework:</strong> {selectedControl.framework_reference.replace(/_/g, ' ')}</span>
              <span><strong>Category:</strong> {selectedControl.category}</span>
              {selectedControl.mandatory_for_prod && (
                <span className="text-red-600 font-medium">Mandatory for Production</span>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="needs_review">Needs Review</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>

        <div>
          <label className="label">Rationale</label>
          <textarea
            className="input"
            rows={4}
            value={formData.rationale}
            onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
            placeholder="Explain why this control evaluation has the selected status..."
            required
          />
        </div>

        <div>
          <label className="label">Evidence Links (optional)</label>
          <textarea
            className="input"
            rows={3}
            value={formData.evidence_links}
            onChange={(e) => setFormData({ ...formData, evidence_links: e.target.value })}
            placeholder="Enter URLs or file paths, one per line..."
          />
          <p className="mt-1 text-xs text-gray-500">Add links to documentation, test results, or other evidence supporting this evaluation</p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Control Evaluation'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
