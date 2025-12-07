'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/types';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entity_type: '',
    action_type: '',
    limit: 100,
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== 0)
      );
      const data = await api.auditLog.list(params);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading audit log..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-2 text-gray-600">
          Complete audit trail of all system changes
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Entity Type</label>
            <select
              className="input text-sm"
              value={filters.entity_type}
              onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            >
              <option value="">All Entities</option>
              <option value="model">Model</option>
              <option value="lineage">Lineage</option>
              <option value="control_evaluation">Control Evaluation</option>
              <option value="explainability">Explainability</option>
              <option value="bias">Bias</option>
              <option value="drift">Drift</option>
              <option value="rag_evaluation">RAG Evaluation</option>
              <option value="risk_assessment">Risk Assessment</option>
              <option value="philosophy">Philosophy</option>
              <option value="evidence_pack">Evidence Pack</option>
            </select>
          </div>

          <div>
            <label className="label">Action Type</label>
            <select
              className="input text-sm"
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
            >
              <option value="">All Actions</option>
              <option value="create_model">Create Model</option>
              <option value="add_lineage">Add Lineage</option>
              <option value="update_control_evaluation">Update Control</option>
              <option value="add_explainability">Add Explainability</option>
              <option value="add_bias_test">Add Bias Test</option>
              <option value="add_drift">Add Drift</option>
              <option value="add_rag_evaluation">Add RAG Evaluation</option>
              <option value="add_risk_assessment">Add Risk Assessment</option>
              <option value="create_philosophy">Create Philosophy</option>
              <option value="generate_evidence_pack">Generate Evidence Pack</option>
            </select>
          </div>

          <div>
            <label className="label">Limit</label>
            <select
              className="input text-sm"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
            >
              <option value="50">50 entries</option>
              <option value="100">100 entries</option>
              <option value="250">250 entries</option>
              <option value="500">500 entries</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card title={`Audit Log (${logs.length} entries)`}>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit log entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Model ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.user_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.action_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.entity_type}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {log.entity_id}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {log.model_id || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
