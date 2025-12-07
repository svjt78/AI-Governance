import { useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

interface BiasEvaluationFormProps {
  modelId: string;
  onSuccess: () => void;
}

export default function BiasEvaluationForm({ modelId, onSuccess }: BiasEvaluationFormProps) {
  const [formData, setFormData] = useState({
    test_scope: '',
    protected_or_prohibited_factor: '',
    test_type: '',
    metric: '',
    value: '',
    threshold: '',
    status: 'acceptable',
    customer_harm_risk: 'low',
    regulatory_concern_flag: false,
    mitigation_plan: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.bias.create(modelId, {
        ...formData,
        value: parseFloat(formData.value),
        threshold: parseFloat(formData.threshold),
      });

      setMessage({ type: 'success', text: 'Bias evaluation submitted successfully!' });

      // Reset form
      setFormData({
        test_scope: '',
        protected_or_prohibited_factor: '',
        test_type: '',
        metric: '',
        value: '',
        threshold: '',
        status: 'acceptable',
        customer_harm_risk: 'low',
        regulatory_concern_flag: false,
        mitigation_plan: '',
      });

      // Notify parent to refresh
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit bias evaluation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Add Bias & Unfair Discrimination Test">
      {message && (
        <div className="mb-4">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Test Scope</label>
            <input
              type="text"
              className="input"
              value={formData.test_scope}
              onChange={(e) => setFormData({ ...formData, test_scope: e.target.value })}
              placeholder="e.g., Personal_Auto_Pricing"
              required
            />
          </div>

          <div>
            <label className="label">Protected/Prohibited Factor</label>
            <select
              className="input"
              value={formData.protected_or_prohibited_factor}
              onChange={(e) => setFormData({ ...formData, protected_or_prohibited_factor: e.target.value })}
              required
            >
              <option value="">Select factor...</option>
              <option value="gender">Gender</option>
              <option value="race">Race</option>
              <option value="age">Age</option>
              <option value="zip_code_proxy_for_race">ZIP Code (proxy for race)</option>
              <option value="credit_score">Credit Score</option>
              <option value="occupation">Occupation</option>
              <option value="education">Education</option>
            </select>
          </div>

          <div>
            <label className="label">Test Type</label>
            <select
              className="input"
              value={formData.test_type}
              onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
              required
            >
              <option value="">Select type...</option>
              <option value="Demographic_Parity">Demographic Parity</option>
              <option value="Disparate_Impact_Analysis">Disparate Impact Analysis</option>
              <option value="Equal_Opportunity">Equal Opportunity</option>
              <option value="Equalized_Odds">Equalized Odds</option>
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
              <option value="Statistical_Parity_Difference">Statistical Parity Difference</option>
              <option value="Adverse_Impact_Ratio">Adverse Impact Ratio</option>
              <option value="Disparate_Impact_Ratio">Disparate Impact Ratio</option>
            </select>
          </div>

          <div>
            <label className="label">Test Value</label>
            <input
              type="number"
              step="0.001"
              className="input"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g., 0.03"
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
              <option value="acceptable">Acceptable</option>
              <option value="needs_review">Needs Review</option>
              <option value="unacceptable">Unacceptable</option>
            </select>
          </div>

          <div>
            <label className="label">Customer Harm Risk</label>
            <select
              className="input"
              value={formData.customer_harm_risk}
              onChange={(e) => setFormData({ ...formData, customer_harm_risk: e.target.value })}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.regulatory_concern_flag}
              onChange={(e) => setFormData({ ...formData, regulatory_concern_flag: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Regulatory Concern Flag</span>
          </label>
        </div>

        <div>
          <label className="label">Mitigation Plan (if needed)</label>
          <textarea
            className="input"
            rows={3}
            value={formData.mitigation_plan}
            onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
            placeholder="Describe mitigation actions..."
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Bias Test'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
