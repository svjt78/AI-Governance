import { useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

interface RiskAssessmentFormProps {
  modelId: string;
  onSuccess: () => void;
}

export default function RiskAssessmentForm({ modelId, onSuccess }: RiskAssessmentFormProps) {
  const [formData, setFormData] = useState({
    risk_score: '',
    risk_level: 'medium',
    primary_risk_drivers: '',
    business_impact_summary: '',
    mitigation_plan: '',
    residual_risk_accepted: false,
    residual_risk_approver: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const driversArray = formData.primary_risk_drivers
        .split('\n')
        .filter(d => d.trim())
        .map(d => d.trim());

      await api.risk.create(modelId, {
        risk_score: parseFloat(formData.risk_score),
        risk_level: formData.risk_level,
        primary_risk_drivers: driversArray,
        business_impact_summary: formData.business_impact_summary,
        mitigation_plan: formData.mitigation_plan || undefined,
        residual_risk_accepted: formData.residual_risk_accepted,
        residual_risk_approver: formData.residual_risk_approver || undefined,
      });

      setMessage({ type: 'success', text: 'Risk assessment submitted successfully!' });

      // Reset form
      setFormData({
        risk_score: '',
        risk_level: 'medium',
        primary_risk_drivers: '',
        business_impact_summary: '',
        mitigation_plan: '',
        residual_risk_accepted: false,
        residual_risk_approver: '',
      });

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit risk assessment' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Add Risk Assessment">
      {message && (
        <div className="mb-4">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Risk Score (0-100)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="input"
              value={formData.risk_score}
              onChange={(e) => setFormData({ ...formData, risk_score: e.target.value })}
              placeholder="e.g., 45.5"
              required
            />
          </div>

          <div>
            <label className="label">Risk Level</label>
            <select
              className="input"
              value={formData.risk_level}
              onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Primary Risk Drivers (one per line)</label>
          <textarea
            className="input"
            rows={4}
            value={formData.primary_risk_drivers}
            onChange={(e) => setFormData({ ...formData, primary_risk_drivers: e.target.value })}
            placeholder="Enter each risk driver on a new line..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter each risk driver on a separate line</p>
        </div>

        <div>
          <label className="label">Business Impact Summary</label>
          <textarea
            className="input"
            rows={3}
            value={formData.business_impact_summary}
            onChange={(e) => setFormData({ ...formData, business_impact_summary: e.target.value })}
            placeholder="Describe the business impact..."
            required
          />
        </div>

        <div>
          <label className="label">Mitigation Plan</label>
          <textarea
            className="input"
            rows={3}
            value={formData.mitigation_plan}
            onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
            placeholder="Describe mitigation actions..."
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.residual_risk_accepted}
              onChange={(e) => setFormData({ ...formData, residual_risk_accepted: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Residual Risk Accepted</span>
          </label>
        </div>

        {formData.residual_risk_accepted && (
          <div>
            <label className="label">Residual Risk Approver</label>
            <input
              type="text"
              className="input"
              value={formData.residual_risk_approver}
              onChange={(e) => setFormData({ ...formData, residual_risk_approver: e.target.value })}
              placeholder="e.g., Chief_Risk_Officer"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Risk Assessment'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
