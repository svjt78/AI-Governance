# AI Governance App – Insurance (P&C & Commercial)  
## Full-Stack Rapid Prototype (FastAPI Backend + Next.js Frontend, No DB)

---

## 1. Purpose & Context

Property & Casualty (P&C) and Commercial insurers are increasingly using AI in:

- Pricing & rating  
- Underwriting (eligibility, triage, appetite)  
- Claims (severity, fraud, segmentation)  
- Document intelligence & AI copilots for underwriters/adjusters  

Regulators (state DOIs, NAIC, international insurance supervisors) expect:

- No **unfair discrimination**  
- Governed use of **external data & models**  
- **Transparent & explainable** decisions  
- **Audit-ready documentation** for market conduct exams and internal audits  

This app is a **governance console** for AI models in insurance. It allows risk, product, underwriting, and compliance teams to:

- Register models & their insurance context  
- Track lineage and external data sources  
- Capture fairness/bias/unfair discrimination testing  
- Track RAG grounding & hallucination behavior for insurance copilots  
- Generate audit-ready **evidence packs**  
- Document a clear **AI governance philosophy** for insurance  

### Hard Constraints

- **Domain:** Insurance only (P&C and Commercial).  
- **Storage:** No database. All persistence via **flat files** (JSON / NDJSON).  
- **Backend:** FastAPI API service.  
- **Frontend:** Next.js React app (admin console).  

---

## 2. High-Level Architecture

### 2.1 Components

1. **Backend (FastAPI)**
   - Exposes REST endpoints under `/api/v1`.
   - Reads/writes JSON / NDJSON state in a `data/` directory.
   - Generates markdown + ZIP evidence packs in `artifacts/`.
   - Provides risk scoring, governance summaries, and optional LLM-assisted governance philosophy drafting.

2. **Frontend (Next.js React)**
   - Insurance AI governance console UI.
   - Admin-style layout (sidebar nav + main content).
   - Uses REST calls to the backend.
   - No direct file persistence; backend is the single source of truth.

3. **File Storage (Flat Files Only)**
   - `data/` – JSON and NDJSON files for all entities.
   - `artifacts/evidence_packs/` – generated markdown & ZIP evidence packs.

---

## 3. Backend Specification (Insurance-Focused, Flat Files)

### 3.1 File Layout

- `data/models.json` – array of model objects.
- `data/controls.json` – governance control catalog.
- `data/lineage.ndjson`
- `data/control_evaluations.ndjson`
- `data/explainability.ndjson`
- `data/drift.ndjson`
- `data/bias.ndjson`
- `data/rag_evaluations.ndjson`
- `data/risk_assessments.ndjson`
- `data/governance_philosophy.ndjson`
- `data/evidence_packs.ndjson`
- `data/audit_log.ndjson`

- `artifacts/evidence_packs/{evidence_pack_id}/` – generated markdown files + a ZIP.

The prototype must **not** introduce any database (no Postgres, MySQL, Mongo, etc.). All persistence must be through these flat files.

---

### 3.2 Core Entities (Pydantic Models)

#### 3.2.1 Insurance AI Model

Represents an AI system used in an insurance workflow.

- `model_id` (string, unique)
- `name`
- `version`
- `model_type` – `"llm" | "rag" | "agent" | "classifier" | "regressor" | "rules_plus_model"`
- `business_domain` – `"P&C_Personal" | "P&C_Commercial" | "Reinsurance" | "Specialty"`
- `line_of_business` – e.g., `"Personal Auto"`, `"Homeowners"`, `"Commercial Auto"`, `"Workers_Compensation"`, `"GL"`, `"Property"`.
- `use_case_category` – `"Pricing" | "Underwriting" | "Claims" | "Fraud" | "Marketing" | "Customer_Service" | "Operational_Copilot"`.
- `detailed_use_case` – free-text description.
- `owner_team` – e.g., `Commercial_UW_Analytics`.
- `product_or_program` – e.g., `"Small_Commercial_WC"`.
- `jurisdictions` – list of state codes (e.g., `["WI", "MN"]`).
- `deployment_environment` – `"dev" | "test" | "prod"`.
- `deployment_details` – JSON object (endpoint, region, integrated systems, etc.).
- `external_data_sources` – list (e.g., `"credit_based_insurance_score"`, `"telematics_score"`, `"third_party_business_risk_score"`).
- `governance_status` – `"draft" | "in_review" | "approved_for_prod" | "temporarily_suspended" | "retired"`.

#### 3.2.2 Lineage Entry

- `timestamp`
- `model_id`
- `event_type` – `"lineage_snapshot"`.
- `data_sources`
- `external_data_sources`
- `training_pipeline`
- `feature_store_refs`
- `artifacts`
- `deployment` – (endpoint, infra, region, integrated insurance systems).

#### 3.2.3 Governance Control Catalog Entry

- `control_id`
- `framework_reference` – e.g., `"NAIC_AI_Principles"`, `"Unfair_Discrimination"`, `"External_Data_Governance"`, `"Model_Documentation_For_DOI"`.
- `regulatory_focus` – e.g., `"Unfair_Discrimination"`, `"External_Data"`, `"Consumer_Transparency"`, `"Claims_Fairness"`.
- `category` – `"Explainability" | "Data&Bias" | "Compliance" | "Risk" | "Operations"`.
- `description` – insurance-specific description.
- `mandatory_for_prod` – boolean.
- `applies_to_use_case_categories` – list of categories.

#### 3.2.4 Control Evaluation

- `model_id`
- `control_id`
- `status` – `"passed" | "failed" | "not_applicable" | "needs_review"`.
- `rationale`
- `evidence_links`
- `last_updated`.

#### 3.2.5 Explainability Evaluation

- `model_id`
- `decision_context` – e.g., `"New_Business_Underwriting"`, `"Renewal_Pricing"`.
- `method` – `"shap" | "lime" | "global_feature_importance" | "local_explanations" | "prompt_trace" | "agent_trace"`.
- `summary`
- `key_findings`
- `limitations`
- `attachment_refs`
- `explainability_score` (0–100, optional).
- `suitable_for_customer_communication` – boolean.

#### 3.2.6 Drift Evaluation

- `model_id`
- `drift_type` – `"data" | "prediction" | "concept"`.
- `metric`
- `value`
- `threshold`
- `status` – `"within_tolerance" | "breached"`.
- `observation_window`
- `insurance_impact_summary`
- `notes`.

#### 3.2.7 Bias / Unfair Discrimination Evaluation

- `model_id`
- `test_scope` – e.g., `"New_Business_Auto_Underwriting"`.
- `protected_or_prohibited_factor` – e.g., `"race"`, `"gender"`, `"zip_code_proxy"`, `"credit_based_score"`.
- `test_type`
- `metric`
- `value`
- `threshold`
- `status` – `"acceptable" | "needs_review" | "unacceptable"`.
- `mitigation_plan` (optional).
- `customer_harm_risk` – `"low" | "medium" | "high"`.
- `regulatory_concern_flag` – boolean.

#### 3.2.8 RAG Evaluation (Insurance Copilots)

- `model_id`
- `eval_batch_id`
- `grounding_score`
- `hallucination_rate`
- `context_relevance_score`
- `method` – `"human_labeling" | "LLM_judge"`.
- `summary`
- `notes`
- `coverage_misstatement_flag` – boolean.

#### 3.2.9 Risk Assessment

- `model_id`
- `risk_score` – 0 to 100.
- `risk_level` – `"low" | "medium" | "high" | "critical"`.
- `primary_risk_drivers` – list of text.
- `business_impact_summary`
- `mitigation_plan`
- `residual_risk_accepted` – boolean.
- `residual_risk_approver`
- `timestamp`.

#### 3.2.10 Governance Philosophy (Insurance-Specific)

- `scope` – `"org" | "business_domain" | "line_of_business" | "model"`.
- `scope_ref` – e.g., `"enterprise"`, `"P&C_Commercial"`, `"WC"`, `"small_commercial_wc_underwriting_rag_v1"`.
- `risk_appetite`
- `fairness_and_unfair_discrimination_principles`
- `external_data_and_vendor_controls`
- `regulatory_alignment_principles`
- `safety_and_customer_protection_principles`
- `explainability_and_customer_communication`
- `auditability_and_DOI_exam_readiness`
- `lifecycle_governance`
- `generated_by_llm` – boolean.
- `source_prompt_ref` – optional.

#### 3.2.11 Evidence Pack Metadata

- `evidence_pack_id`
- `model_id`
- `created_at`
- `created_by`
- `jurisdictions_covered`
- `included_sections`
- `zip_path`.

#### 3.2.12 Audit Log Entry

- `timestamp`
- `user_id`
- `action_type`
- `model_id` (optional)
- `entity_type`
- `entity_id`
- `old_value` (optional)
- `new_value` (optional).

---

### 3.3 Backend API Endpoints

Base path: `/api/v1`.

#### 3.3.1 Model Registry & Lineage

- `POST /models` – register a new model.
- `GET  /models` – list models with filters.
- `GET  /models/{model_id}` – get model + core info.
- `POST /models/{model_id}/lineage` – append lineage snapshot.

#### 3.3.2 Controls & Evaluations

- `GET  /controls` – return control catalog.
- `POST /models/{model_id}/controls/evaluations` – upsert/control evaluations.

#### 3.3.3 Evaluations

- `POST /models/{model_id}/explainability`
- `POST /models/{model_id}/drift`
- `POST /models/{model_id}/bias`
- `POST /models/{model_id}/rag-evaluations`
- `POST /models/{model_id}/risk-assessments`

- `GET  /models/{model_id}/governance-summary`  
  Returns an aggregate view of:
  - Latest control evaluation stats.
  - Latest explainability, drift, bias, RAG evaluations.
  - Latest risk assessment.
  - Governance status.

#### 3.3.4 Governance Philosophy

- `POST /governance/philosophy` – create/update entry; optional `use_llm_to_fill_gaps` flag.
- `GET  /governance/philosophy` – filter by `scope` and `scope_ref`.

#### 3.3.5 Evidence Packs

- `POST /models/{model_id}/evidence-packs` – generate pack:
  - Collects model, lineage, control evaluations, explainability, drift, bias, RAG, risk, governance philosophy, audit log summary.
  - Produces multiple `.md` files and a ZIP.
  - Writes metadata into `evidence_packs.ndjson`.
- `GET  /evidence-packs/{evidence_pack_id}/download` – returns ZIP.

#### 3.3.6 Audit Log

- `GET /audit-log` – filterable by `model_id`, `entity_type`, `action_type`, `from`, `to`.

---

### 3.4 Backend Non-Functional Requirements

- **No database** – do not add any DB. Use JSON/NDJSON files only.
- Atomic write operations (write to temp file then rename).
- CORS enabled for the frontend origin.
- Environment variables:
  - `GOV_APP_DATA_DIR`
  - `GOV_APP_ARTIFACTS_DIR`
  - `OPENAI_API_KEY` (optional).
- Dockerfile runs `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

---

## 4. Frontend Specification – Next.js React Console

### 4.1 Tech Stack

- **Framework:** Next.js (TypeScript preferred).  
- **Styling:** Tailwind CSS.  
- **HTTP Client:** `fetch` or `axios` (SWR/React Query optional).  
- **Config:** `NEXT_PUBLIC_API_BASE_URL` pointing to backend (e.g., `http://localhost:8000/api/v1`).  

---

### 4.2 Layout & Navigation

- Left-hand **sidebar navigation** with links:
  - Dashboard
  - Models
  - Governance Philosophy
  - Evidence Packs
  - Audit Log

- Top-level pages:
  - `/` – Dashboard
  - `/models` – Model registry list
  - `/models/new` – Register model
  - `/models/[model_id]` – Model detail with tabs
  - `/governance/philosophy` – Philosophy editor
  - `/evidence-packs` – Evidence pack browser
  - `/audit-log` – Audit log viewer

---

### 4.3 Page-Level Behavior

#### 4.3.1 Dashboard (`/`)

- Fetch: `GET /models` and, optionally, `GET /models/{id}/governance-summary` for key models.
- Show KPI tiles:
  - Total models
  - Models in prod
  - Models with `"high"` or `"critical"` risk
  - Models with `"unacceptable"` or `"needs_review"` bias status
- Show a table or cards:
  - Model name, LoB, use case, governance status, risk level, bias flag.
- Provide buttons:
  - “Register New Model”
  - “View Evidence Packs”
  - “Edit Governance Philosophy”

#### 4.3.2 Model Registry List (`/models`)

- Fetch: `GET /models`.
- Filters:
  - `business_domain`, `line_of_business`, `use_case_category`, `governance_status`, `jurisdiction`.
- Table columns:
  - Name, Version, LoB, Use Case, Jurisdictions, Governance Status, Actions.
- Actions:
  - “View” → `/models/[model_id]`
  - “Generate Evidence Pack” → calls backend then refreshes.

#### 4.3.3 New Model (`/models/new`)

- Form mapped to `POST /models` fields.
- On submit:
  - Validate required fields.
  - Call backend.
  - Navigate to `/models/[model_id]` on success.
- Show error messages on failure.

#### 4.3.4 Model Detail (`/models/[model_id]`)

Layout:

- Header: model name, version, LoB, use case, governance status, risk badge.
- Tabs (client-side):

1. **Overview**
   - Fetch: `GET /models/{model_id}` + `/models/{model_id}/governance-summary`.
   - Show risk level, control stats, latest bias/unfair discrimination summary, RAG summary, drift summary.

2. **Lineage**
   - Show lineage snapshots (parsed from `/models/{model_id}` or a dedicated lineage query if added).
   - Button: “Add Lineage Snapshot” → form → `POST /models/{model_id}/lineage`.

3. **Controls & Evaluations**
   - Fetch: `GET /controls` and control evaluations from summary.
   - Show mapping of control catalog + model’s evaluation status.
   - Button: “Update Control Evaluations” → multi-row form → `POST /models/{model_id}/controls/evaluations`.

4. **Explainability & Bias**
   - Lists of explainability entries and bias/unfair discrimination entries.
   - Buttons:
     - “Add Explainability Result” → `POST /models/{model_id}/explainability`.
     - “Add Bias Test Result” → `POST /models/{model_id}/bias`.

5. **RAG & Drift**
   - Lists of RAG evaluations and drift evaluations.
   - Buttons:
     - “Add RAG Evaluation” → `POST /models/{model_id}/rag-evaluations`.
     - “Add Drift Evaluation” → `POST /models/{model_id}/drift`.

6. **Risk & Evidence**
   - Show latest risk assessment (from summary).
   - Button: “Add Risk Assessment” → `POST /models/{model_id}/risk-assessments`.
   - Button: “Generate Evidence Pack” → `POST /models/{model_id}/evidence-packs`.
   - List evidence packs for this model (if a list endpoint is later added or derived from metadata).

#### 4.3.5 Governance Philosophy (`/governance/philosophy`)

- UI:
  - Select scope: Org / Business Domain / LoB / Model.
  - Select scope reference (values from `models` or static).
  - Load existing philosophy via `GET /governance/philosophy?scope=&scope_ref=`.
  - Display form for:
    - Risk appetite
    - Fairness/unfair discrimination principles
    - External data & vendor controls
    - Regulatory alignment
    - Safety & customer protection
    - Explainability & customer communication
    - Auditability & DOI exam readiness
    - Lifecycle governance
  - Checkbox: “Use AI to complete missing sections”.
- Save:
  - `POST /governance/philosophy` with `use_llm_to_fill_gaps` flag if checked.

#### 4.3.6 Evidence Packs (`/evidence-packs`)

- UI:
  - Table listing evidence packs:
    - Evidence Pack ID
    - Model
    - LoB
    - Jurisdictions
    - Created at
    - Created by
  - Download button to call `GET /evidence-packs/{id}/download`.
- Data:
  - Either a dedicated `GET /evidence-packs` endpoint (can be added) or derived indirectly (e.g., via `audit-log` and `evidence_packs.ndjson` if surfaced).

#### 4.3.7 Audit Log (`/audit-log`)

- UI:
  - Filters: model, entity type, action type, date range.
  - Table with:
    - Time
    - User
    - Action
    - Entity
    - Model (if applicable)
- Data:
  - `GET /audit-log` with query parameters.

---

### 4.4 Frontend Non-Functional Requirements

- Responsive enough for laptop and tablet.
- Clean, admin-style visual design (Tailwind utility classes).
- Proper error message display on API errors.
- Use `NEXT_PUBLIC_API_BASE_URL` for backend URL.
- No authentication in prototype.

---

## 5. Dev & Deployment

- Backend:
  - Runs on `http://localhost:8000`.
  - Dockerfile using Python base image and Uvicorn.
- Frontend:
  - Runs on `http://localhost:3000`.
  - Standard Next.js `dev`, `build`, `start` scripts.
- CORS:
  - FastAPI app must allow calls from frontend origin.
- Optional `docker-compose.yml`:
  - One service for backend, one for frontend.
  - Bind mount `./data` and `./artifacts` for persistence during development.

---

## 6. Governance Questions Answered

1. **How do you ensure AI solutions remain compliant in regulated insurance environments?**
   - Models are registered with full insurance context.
   - Controls, evaluations, and risk are structured and persisted.
   - Evidence packs provide audit-ready documentation.

2. **What’s your philosophy on AI governance in insurance?**
   - Philosophy captured in a structured template per org/LoB/model.
   - Frontend lets leadership and compliance review/edit it.
   - Optional LLM assistance helps draft consistent, insurance-specific governance narratives.
