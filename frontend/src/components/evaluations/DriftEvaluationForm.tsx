import { useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

interface DriftEvaluationFormProps {
  modelId: string;
  onSuccess: () => void;
}

export default function DriftEvaluationForm({ modelId, onSuccess }: DriftEvaluationFormProps) {
  const [formData, setFormData] = useState({
    drift_type: 'data',
    metric: '',
    value: '',
    threshold: '',
    status: 'within_tolerance',
    observation_window: '',
    insurance_impact_summary: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.drift.create(modelId, {
        ...formData,
        value: parseFloat(formData.value),
        threshold: parseFloat(formData.threshold),
      });

      setMessage({ type: 'success', text: 'Drift evaluation submitted successfully!' });

      // Reset form
      setFormData({
        drift_type: 'data',
        metric: '',
        value: '',
        threshold: '',
        status: 'within_tolerance',
        observation_window: '',
        insurance_impact_summary: '',
        notes: '',
      });

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit drift evaluation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Add Drift Monitoring Evaluation">
      {message && (
        <div className="mb-4">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Drift Type</label>
            <select
              className="input"
              value={formData.drift_type}
              onChange={(e) => setFormData({ ...formData, drift_type: e.target.value })}
              required
            >
              <option value="data">Data Drift</option>
              <option value="prediction">Prediction Drift</option>
              <option value="concept">Concept Drift</option>
            </select>
          </div>

          <div>
            <label className="label">Metric</label>
            <select
              className="input"
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              required
            >
              <option value="">Select metric...</option>
              <option value="PSI">Population Stability Index (PSI)</option>
              <option value="KS_Statistic">Kolmogorov-Smirnov Statistic</option>
              <option value="Wasserstein_Distance">Wasserstein Distance</option>
              <option value="KL_Divergence">KL Divergence</option>
            </select>
          </div>

          <div>
            <label className="label">Measured Value</label>
            <input
              type="number"
              step="0.001"
              className="input"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g., 0.045"
              required
            />
          </div>

          <div>
            <label className="label">Threshold</label>
            <input
              type="number"
              step="0.001"
              className="input"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              placeholder="e.g., 0.10"
              required
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="within_tolerance">Within Tolerance</option>
              <option value="breached">Breached</option>
            </select>
          </div>

          <div>
            <label className="label">Observation Window</label>
            <input
              type="text"
              className="input"
              value={formData.observation_window}
              onChange={(e) => setFormData({ ...formData, observation_window: e.target.value })}
              placeholder="e.g., Last 30 days"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Insurance Impact Summary</label>
          <textarea
            className="input"
            rows={3}
            value={formData.insurance_impact_summary}
            onChange={(e) => setFormData({ ...formData, insurance_impact_summary: e.target.value })}
            placeholder="Describe impact on pricing, underwriting, or claims..."
            required
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional observations..."
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Drift Evaluation'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
