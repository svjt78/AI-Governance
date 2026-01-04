// API client for InsureGov AI Governance

import type {
  InsuranceAIModel,
  LineageEntry,
  ControlCatalogEntry,
  ControlEvaluation,
  ExplainabilityEvaluation,
  DriftEvaluation,
  BiasEvaluation,
  RAGEvaluation,
  RiskAssessment,
  GovernancePhilosophy,
  EvidencePack,
  AuditLogEntry,
  GovernanceSummary,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006/api/v1';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Models
  models: {
    list: (params?: {
      business_domain?: string;
      line_of_business?: string;
      use_case_category?: string;
      governance_status?: string;
      jurisdiction?: string;
    }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchAPI<InsuranceAIModel[]>(`/models${query ? `?${query}` : ''}`);
    },

    get: (modelId: string) =>
      fetchAPI<InsuranceAIModel>(`/models/${modelId}`),

    create: (model: Partial<InsuranceAIModel>) =>
      fetchAPI<InsuranceAIModel>('/models', {
        method: 'POST',
        body: JSON.stringify(model),
      }),

    getSummary: (modelId: string) =>
      fetchAPI<GovernanceSummary>(`/models/${modelId}/governance-summary`),
  },

  // Lineage
  lineage: {
    list: (modelId: string) =>
      fetchAPI<LineageEntry[]>(`/models/${modelId}/lineage`),

    create: (modelId: string, lineage: Partial<LineageEntry>) =>
      fetchAPI(`/models/${modelId}/lineage`, {
        method: 'POST',
        body: JSON.stringify(lineage),
      }),
  },

  // Controls
  controls: {
    list: () =>
      fetchAPI<ControlCatalogEntry[]>('/controls'),

    get: (controlId: string) =>
      fetchAPI<ControlCatalogEntry>(`/controls/${controlId}`),

    create: (control: Partial<ControlCatalogEntry>) =>
      fetchAPI<ControlCatalogEntry>('/controls', {
        method: 'POST',
        body: JSON.stringify(control),
      }),

    update: (controlId: string, updates: Partial<ControlCatalogEntry>) =>
      fetchAPI<ControlCatalogEntry>(`/controls/${controlId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),

    delete: (controlId: string) =>
      fetchAPI(`/controls/${controlId}`, {
        method: 'DELETE',
      }),

    getEvaluations: (modelId: string) =>
      fetchAPI<ControlEvaluation[]>(`/models/${modelId}/controls/evaluations`),

    createEvaluations: (modelId: string, evaluations: Partial<ControlEvaluation>[]) =>
      fetchAPI(`/models/${modelId}/controls/evaluations`, {
        method: 'POST',
        body: JSON.stringify(evaluations),
      }),
  },

  // Evaluations
  explainability: {
    list: (modelId: string) =>
      fetchAPI<ExplainabilityEvaluation[]>(`/models/${modelId}/explainability`),

    create: (modelId: string, evaluation: Partial<ExplainabilityEvaluation>) =>
      fetchAPI(`/models/${modelId}/explainability`, {
        method: 'POST',
        body: JSON.stringify({ ...evaluation, model_id: modelId }),
      }),
  },

  drift: {
    list: (modelId: string) =>
      fetchAPI<DriftEvaluation[]>(`/models/${modelId}/drift`),

    create: (modelId: string, evaluation: Partial<DriftEvaluation>) =>
      fetchAPI(`/models/${modelId}/drift`, {
        method: 'POST',
        body: JSON.stringify({ ...evaluation, model_id: modelId }),
      }),
  },

  bias: {
    list: (modelId: string) =>
      fetchAPI<BiasEvaluation[]>(`/models/${modelId}/bias`),

    create: (modelId: string, evaluation: Partial<BiasEvaluation>) =>
      fetchAPI(`/models/${modelId}/bias`, {
        method: 'POST',
        body: JSON.stringify({ ...evaluation, model_id: modelId }),
      }),
  },

  rag: {
    list: (modelId: string) =>
      fetchAPI<RAGEvaluation[]>(`/models/${modelId}/rag-evaluations`),

    create: (modelId: string, evaluation: Partial<RAGEvaluation>) =>
      fetchAPI(`/models/${modelId}/rag-evaluations`, {
        method: 'POST',
        body: JSON.stringify(evaluation),
      }),
  },

  risk: {
    list: (modelId: string) =>
      fetchAPI<RiskAssessment[]>(`/models/${modelId}/risk-assessments`),

    create: (modelId: string, assessment: Partial<RiskAssessment>) =>
      fetchAPI(`/models/${modelId}/risk-assessments`, {
        method: 'POST',
        body: JSON.stringify({ ...assessment, model_id: modelId }),
      }),
  },

  // Philosophy
  philosophy: {
    list: (params?: { scope?: string; scope_ref?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchAPI<GovernancePhilosophy[]>(`/governance/philosophy${query ? `?${query}` : ''}`);
    },

    create: (philosophy: Partial<GovernancePhilosophy>, useLLM = false) =>
      fetchAPI<GovernancePhilosophy>(`/governance/philosophy?use_llm_to_fill_gaps=${useLLM}`, {
        method: 'POST',
        body: JSON.stringify(philosophy),
      }),

    delete: (scope: string, scopeRef: string) =>
      fetchAPI(`/governance/philosophy?scope=${scope}&scope_ref=${encodeURIComponent(scopeRef)}`, {
        method: 'DELETE',
      }),

    download: (scope: string, scopeRef: string) => {
      const url = `${API_BASE_URL}/governance/philosophy/download?scope=${scope}&scope_ref=${encodeURIComponent(scopeRef)}`;
      window.open(url, '_blank');
    },
  },

  // Evidence Packs
  evidencePacks: {
    list: () =>
      fetchAPI<EvidencePack[]>('/evidence-packs'),

    generate: (modelId: string, createdBy = 'system') =>
      fetchAPI<EvidencePack>(`/models/${modelId}/evidence-packs?created_by=${createdBy}`, {
        method: 'POST',
      }),

    download: (packId: string) => {
      const url = `${API_BASE_URL}/evidence-packs/${packId}/download`;
      window.open(url, '_blank');
    },
  },

  // Audit Log
  auditLog: {
    list: (params?: {
      model_id?: string;
      entity_type?: string;
      action_type?: string;
      limit?: number;
    }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchAPI<AuditLogEntry[]>(`/audit-log${query ? `?${query}` : ''}`);
    },
  },
};
