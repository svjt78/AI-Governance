import { useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

interface ExplainabilityFormProps {
  modelId: string;
  modelType: string;
  onSuccess: () => void;
}

export default function ExplainabilityForm({ modelId, modelType, onSuccess }: ExplainabilityFormProps) {
  const getDefaultMethod = () => {
    if (modelType === 'rag') return 'prompt_trace';
    if (modelType === 'agent') return 'agent_trace';
    return 'shap';
  };

  const [formData, setFormData] = useState({
    decision_context: '',
    method: getDefaultMethod(),
    summary: '',
    key_findings: '',
    limitations: '',
    explainability_score: '',
    suitable_for_customer_communication: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const keyFindingsArray = formData.key_findings
        .split('\n')
        .filter(f => f.trim())
        .map(f => f.trim());

      await api.explainability.create(modelId, {
        decision_context: formData.decision_context,
        method: formData.method,
        summary: formData.summary,
        key_findings: keyFindingsArray,
        limitations: formData.limitations,
        explainability_score: formData.explainability_score ? parseFloat(formData.explainability_score) : undefined,
        suitable_for_customer_communication: formData.suitable_for_customer_communication,
      });

      setMessage({ type: 'success', text: 'Explainability evaluation submitted successfully!' });

      // Reset form
      setFormData({
        decision_context: '',
        method: getDefaultMethod(),
        summary: '',
        key_findings: '',
        limitations: '',
        explainability_score: '',
        suitable_for_customer_communication: false,
      });

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit explainability evaluation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Add Explainability Evaluation">
      {message && (
        <div className="mb-4">
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Decision Context</label>
            <input
              type="text"
              className="input"
              value={formData.decision_context}
              onChange={(e) => setFormData({ ...formData, decision_context: e.target.value })}
              placeholder="e.g., Pricing_Decisions"
              required
            />
          </div>

          <div>
            <label className="label">Method</label>
            <select
              className="input"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              required
            >
              <option value="shap">SHAP</option>
              <option value="lime">LIME</option>
              <option value="prompt_trace">Prompt Trace (RAG)</option>
              <option value="agent_trace">Agent Trace</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Explainability Score (0-100, optional)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="input"
              value={formData.explainability_score}
              onChange={(e) => setFormData({ ...formData, explainability_score: e.target.value })}
              placeholder="e.g., 85.5"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.suitable_for_customer_communication}
                onChange={(e) => setFormData({ ...formData, suitable_for_customer_communication: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Suitable for Customer Communication</span>
            </label>
          </div>
        </div>

        <div>
          <label className="label">Summary</label>
          <textarea
            className="input"
            rows={3}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Brief summary of explainability analysis..."
            required
          />
        </div>

        <div>
          <label className="label">Key Findings (one per line)</label>
          <textarea
            className="input"
            rows={4}
            value={formData.key_findings}
            onChange={(e) => setFormData({ ...formData, key_findings: e.target.value })}
            placeholder="Enter each finding on a new line..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter each finding on a separate line</p>
        </div>

        <div>
          <label className="label">Limitations</label>
          <textarea
            className="input"
            rows={2}
            value={formData.limitations}
            onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
            placeholder="Describe limitations of the explainability method..."
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Explainability Evaluation'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
