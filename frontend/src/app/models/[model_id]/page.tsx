'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { InsuranceAIModel, GovernanceSummary, ControlCatalogEntry } from '@/lib/types';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Alert from '@/components/common/Alert';
import Tabs from '@/components/common/Tabs';
import BiasEvaluationForm from '@/components/evaluations/BiasEvaluationForm';
import DriftEvaluationForm from '@/components/evaluations/DriftEvaluationForm';
import ExplainabilityForm from '@/components/evaluations/ExplainabilityForm';
import RiskAssessmentForm from '@/components/evaluations/RiskAssessmentForm';
import ControlEvaluationForm from '@/components/evaluations/ControlEvaluationForm';

export default function ModelDetailPage() {
  const params = useParams();
  const model_id = params.model_id as string;

  const [model, setModel] = useState<InsuranceAIModel | null>(null);
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
  const [controls, setControls] = useState<ControlCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [model_id]);

  const loadData = async () => {
    try {
      const [modelData, summaryData, riskData, controlsData] = await Promise.all([
        api.models.get(model_id),
        api.models.getSummary(model_id),
        api.risk.list(model_id),
        api.controls.list(),
      ]);
      setModel(modelData);
      setSummary(summaryData);
      setRiskAssessments(riskData);
      setControls(controlsData);
    } catch (error) {
      console.error('Error loading model:', error);
      setMessage({ type: 'error', text: 'Failed to load model details' });
    } finally {
      setLoading(false);
    }
  };

  const getControlName = (controlId: string): string => {
    const control = controls.find(c => c.control_id === controlId);
    if (!control) return controlId;  // Fallback to ID if control not found
    return control.regulatory_focus.replace(/_/g, ' ');
  };

  const handleGenerateEvidencePack = async () => {
    setGenerating(true);
    try {
      await api.evidencePacks.generate(model_id, 'web_user');
      setMessage({ type: 'success', text: 'Evidence pack generated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate evidence pack' });
    } finally {
      setGenerating(false);
    }
  };

  const handleEvaluationSuccess = () => {
    setMessage({ type: 'success', text: 'Evaluation submitted! Refreshing data...' });
    loadData();
    // Switch back to overview tab to see the new data
    setActiveTab('overview');
  };

  if (loading) return <Loading message="Loading model details..." />;
  if (!model || !summary) return <Alert type="error" message="Model not found" />;

  // Overview Tab Content (all existing display logic)
  const overviewContent = (
    <div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Model Information">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium">{model.model_type}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Business Domain</dt>
              <dd className="font-medium">{model.business_domain}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Line of Business</dt>
              <dd className="font-medium">{model.line_of_business}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Use Case</dt>
              <dd className="font-medium">{model.use_case_category}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Environment</dt>
              <dd className="font-medium">{model.deployment_environment}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Risk Assessment">
          {summary.risk?.latest ? (
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Risk Score</dt>
                <dd className="font-medium text-2xl">{summary.risk.latest.risk_score}/100</dd>
              </div>
              <div>
                <dt className="text-gray-500">Risk Level</dt>
                <dd>
                  <Badge variant="risk" value={summary.risk.latest.risk_level}>
                    {summary.risk.latest.risk_level}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Primary Drivers</dt>
                <dd className="text-xs">
                  {summary.risk.latest.primary_risk_drivers.slice(0, 2).map((driver, i) => (
                    <div key={i}>• {driver}</div>
                  ))}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No risk assessment available</p>
          )}
        </Card>

        <Card title="Controls & Compliance">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Controls</dt>
              <dd className="font-medium">{summary.control_evaluations.stats.total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-green-600">Passed</dt>
              <dd className="font-medium">{summary.control_evaluations.stats.passed}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-red-600">Failed</dt>
              <dd className="font-medium">{summary.control_evaluations.stats.failed}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-yellow-600">Needs Review</dt>
              <dd className="font-medium">{summary.control_evaluations.stats.needs_review}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Not Applicable</dt>
              <dd className="font-medium">{summary.control_evaluations.stats.not_applicable}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* Use Case Details */}
        <Card title="Use Case Details">
          <p className="text-sm text-gray-700">{model.detailed_use_case}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Owner Team:</span>
              <span className="ml-2 font-medium">{model.owner_team}</span>
            </div>
            <div>
              <span className="text-gray-500">Product/Program:</span>
              <span className="ml-2 font-medium">{model.product_or_program}</span>
            </div>
          </div>
        </Card>

        {/* Jurisdictions & External Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title={`Jurisdictions (${model.jurisdictions.length})`}>
            <div className="flex flex-wrap gap-2">
              {model.jurisdictions.map((jurisdiction) => (
                <Badge key={jurisdiction} variant="default">
                  {jurisdiction}
                </Badge>
              ))}
            </div>
          </Card>

          <Card title={`External Data Sources (${model.external_data_sources.length})`}>
            <ul className="space-y-1 text-sm">
              {model.external_data_sources.map((source, i) => (
                <li key={i} className="text-gray-700">• {source}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Controls Detail */}
        <Card title={`Control Evaluations (${summary.control_evaluations.stats.total})`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Control</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rationale</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.control_evaluations.evaluations.map((evaluation) => (
                  <tr key={evaluation.control_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{getControlName(evaluation.control_id)}</td>
                    <td className="px-4 py-3 text-sm">
                      {evaluation.status === 'passed' && (
                        <Badge variant="status" value="passed">
                          passed
                        </Badge>
                      )}
                      {evaluation.status === 'failed' && (
                        <Badge variant="risk" value="failed">
                          failed
                        </Badge>
                      )}
                      {evaluation.status === 'needs_review' && (
                        <Badge variant="bias" value="needs_review">
                          needs review
                        </Badge>
                      )}
                      {evaluation.status === 'not_applicable' && (
                        <Badge variant="default" value="not_applicable">
                          not applicable
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{evaluation.rationale}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(evaluation.last_updated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Risk Assessments Detail */}
        {riskAssessments.length > 0 && (
          <Card title={`Risk Assessments (${riskAssessments.length})`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Drivers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Impact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mitigation Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riskAssessments.map((assessment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.risk_score}/100</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="risk" value={assessment.risk_level}>
                          {assessment.risk_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {assessment.primary_risk_drivers.map((driver: string, i: number) => (
                          <div key={i}>• {driver}</div>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{assessment.business_impact_summary}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{assessment.mitigation_plan || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(assessment.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Bias & Discrimination */}
        {summary.bias && summary.bias.count > 0 && (
          <Card title="Bias & Unfair Discrimination Testing">
            {summary.bias.latest ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="bias" value={summary.bias.latest.status}>
                    {summary.bias.latest.status}
                  </Badge>
                  {summary.bias.latest.regulatory_concern_flag && (
                    <Badge variant="bias" value="unacceptable">
                      Regulatory Concern
                    </Badge>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Test Scope</dt>
                    <dd className="font-medium">{summary.bias.latest.test_scope}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Protected Factor</dt>
                    <dd className="font-medium">{summary.bias.latest.protected_or_prohibited_factor}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Test Type</dt>
                    <dd className="font-medium">{summary.bias.latest.test_type}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Customer Harm Risk</dt>
                    <dd className="font-medium">{summary.bias.latest.customer_harm_risk}</dd>
                  </div>
                </dl>
                {summary.bias.latest.mitigation_plan && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                    <strong>Mitigation Plan:</strong> {summary.bias.latest.mitigation_plan}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{summary.bias.count} bias tests conducted</p>
            )}
          </Card>
        )}

        {/* Drift Monitoring */}
        {summary.drift && summary.drift.count > 0 && (
          <Card title="Drift Monitoring">
            {summary.drift.latest ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="drift" value={summary.drift.latest.status}>
                    {summary.drift.latest.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{summary.drift.latest.drift_type} drift</span>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Metric</dt>
                    <dd className="font-medium">{summary.drift.latest.metric}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Value / Threshold</dt>
                    <dd className="font-medium">
                      {summary.drift.latest.value.toFixed(3)} / {summary.drift.latest.threshold.toFixed(3)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-gray-700">{summary.drift.latest.insurance_impact_summary}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">{summary.drift.count} drift evaluations</p>
            )}
          </Card>
        )}

        {/* RAG Evaluations (if applicable) */}
        {summary.rag && summary.rag.count > 0 && summary.rag.latest && (
          <Card title="RAG Evaluation (Insurance Copilot)">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Grounding Score</dt>
                <dd className="font-medium text-lg">{(summary.rag.latest.grounding_score * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-gray-500">Hallucination Rate</dt>
                <dd className="font-medium text-lg">{(summary.rag.latest.hallucination_rate * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-gray-500">Context Relevance</dt>
                <dd className="font-medium text-lg">{(summary.rag.latest.context_relevance_score * 100).toFixed(1)}%</dd>
              </div>
            </div>
            {summary.rag.latest.coverage_misstatement_flag && (
              <Alert type="warning" message="Coverage misstatement detected in responses" />
            )}
          </Card>
        )}

        {/* Explainability */}
        {summary.explainability && summary.explainability.latest && (
          <Card title="Explainability">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Method</dt>
                <dd className="font-medium">{summary.explainability.latest.method}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Score</dt>
                <dd className="font-medium">
                  {summary.explainability.latest.explainability_score || 'N/A'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Decision Context</dt>
                <dd className="font-medium">{summary.explainability.latest.decision_context}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-gray-700">{summary.explainability.latest.summary}</p>
          </Card>
        )}
      </div>
    </div>
  );

  // Add Evaluations Tab Content (forms)
  const addEvaluationsContent = (
    <div className="space-y-6">
      <ControlEvaluationForm modelId={model_id} onSuccess={handleEvaluationSuccess} />
      <BiasEvaluationForm modelId={model_id} onSuccess={handleEvaluationSuccess} />
      <DriftEvaluationForm modelId={model_id} onSuccess={handleEvaluationSuccess} />
      <ExplainabilityForm modelId={model_id} modelType={model.model_type} onSuccess={handleEvaluationSuccess} />
      <RiskAssessmentForm modelId={model_id} onSuccess={handleEvaluationSuccess} />
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', content: overviewContent },
    { id: 'add-evaluations', label: 'Add Evaluations', content: addEvaluationsContent },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/models" className="text-sm text-primary-600 hover:text-primary-800 mb-2 inline-block">
              ← Back to Models
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
            <p className="mt-1 text-gray-600">Version {model.version}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="status" value={model.governance_status}>
              {model.governance_status.replace(/_/g, ' ')}
            </Badge>
            {summary.risk?.latest && (
              <Badge variant="risk" value={summary.risk.latest.risk_level}>
                Risk: {summary.risk.latest.risk_level}
              </Badge>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-4">
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
            />
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Button onClick={handleGenerateEvidencePack} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Evidence Pack'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
