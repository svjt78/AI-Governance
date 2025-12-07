'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { InsuranceAIModel, GovernanceSummary } from '@/lib/types';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

export default function Dashboard() {
  const [models, setModels] = useState<InsuranceAIModel[]>([]);
  const [summaries, setSummaries] = useState<Record<string, GovernanceSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const modelsData = await api.models.list();
      setModels(modelsData);

      // Load summaries for all models
      const summariesData: Record<string, GovernanceSummary> = {};
      for (const model of modelsData) {
        try {
          const summary = await api.models.getSummary(model.model_id);
          summariesData[model.model_id] = summary;
        } catch (err) {
          console.error(`Error loading summary for ${model.model_id}:`, err);
        }
      }
      setSummaries(summariesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  const totalModels = models.length;
  const prodModels = models.filter(m => m.deployment_environment === 'prod').length;

  const highRiskModels = Object.values(summaries).filter(
    s => s.risk?.latest?.risk_level === 'high' || s.risk?.latest?.risk_level === 'critical'
  ).length;

  const biasFlags = Object.values(summaries).filter(
    s => s.bias?.regulatory_concerns && s.bias.regulatory_concerns > 0
  ).length;

  const modelsAtRisk = models
    .map(model => ({
      model,
      summary: summaries[model.model_id],
    }))
    .filter(({ summary }) =>
      summary?.risk?.latest?.risk_level === 'high' ||
      summary?.risk?.latest?.risk_level === 'critical' ||
      (summary?.bias?.regulatory_concerns && summary.bias.regulatory_concerns > 0) ||
      (summary?.drift?.breaches && summary.drift.breaches > 0)
    )
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            AI Governance for P&C and Commercial Insurance
          </p>
        </div>
        <Link href="/models/new">
          <Button>Register New Model</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Models</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{totalModels}</p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm font-medium text-gray-500">Prod Models</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{prodModels}</p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm font-medium text-gray-500">High Risk</p>
            <p className="mt-2 text-3xl font-semibold text-red-600">{highRiskModels}</p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm font-medium text-gray-500">Bias Flags</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{biasFlags}</p>
          </div>
        </Card>
      </div>

      {/* Models at Risk */}
      <Card title="Models Requiring Attention" className="mb-8">
        {modelsAtRisk.length === 0 ? (
          <p className="text-sm text-gray-500">No models requiring immediate attention</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LoB</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Use Case</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {modelsAtRisk.map(({ model, summary }) => (
                  <tr key={model.model_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{model.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.line_of_business}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.use_case_category}</td>
                    <td className="px-4 py-3 text-sm">
                      {summary?.risk?.latest && (
                        <Badge variant="risk" value={summary.risk.latest.risk_level}>
                          {summary.risk.latest.risk_level}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {summary?.bias?.regulatory_concerns && summary.bias.regulatory_concerns > 0 && (
                          <Badge variant="bias" value="unacceptable">Bias</Badge>
                        )}
                        {summary?.drift?.breaches && summary.drift.breaches > 0 && (
                          <Badge variant="drift" value="breached">Drift</Badge>
                        )}
                        {summary?.control_evaluations?.stats.failed > 0 && (
                          <span className="text-xs text-red-600">Controls Failed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/models/${model.model_id}`} className="text-primary-600 hover:text-primary-800">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link href="/models" className="block">
              <Button variant="secondary" className="w-full">View All Models</Button>
            </Link>
            <Link href="/governance/philosophy" className="block">
              <Button variant="secondary" className="w-full">Edit Governance Philosophy</Button>
            </Link>
            <Link href="/evidence-packs" className="block">
              <Button variant="secondary" className="w-full">View Evidence Packs</Button>
            </Link>
          </div>
        </Card>

        <Card title="Compliance Summary">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Controls:</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Models in Production:</span>
              <span className="font-medium">{prodModels}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High/Critical Risk:</span>
              <span className="font-medium text-red-600">{highRiskModels}</span>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity">
          <p className="text-sm text-gray-500">
            {models.length > 0 ? (
              <>Last updated: {new Date().toLocaleDateString()}</>
            ) : (
              'No activity yet'
            )}
          </p>
          <div className="mt-4">
            <Link href="/audit-log" className="text-sm text-primary-600 hover:text-primary-800">
              View Full Audit Log →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
