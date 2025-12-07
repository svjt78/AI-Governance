# Claude Code Prompt – Build Full-Stack Insurance AI Governance App

You are an expert full-stack engineer and solution architect.

I have a detailed specification for a **P&C & Commercial insurance-focused AI Governance App** in this workspace:

`ai-governance-insurance-fullstack-spec.md`

Your job is to **design and build the app exactly according to that spec**, as:

- A **FastAPI** backend (flat-file storage, no database), and  
- A **Next.js React** frontend (admin console) that talks to the backend via REST APIs.

---

## 🔍 Step 1 – Read & Summarize the Spec

1. Open and thoroughly read:  
   `ai-governance-insurance-fullstack-spec.md`
2. Summarize back, in your own words:
   - The main entities/data structures.
   - The required backend endpoints.
   - The required frontend pages, routes, and key UI components.
   - The storage model (flat files only).
3. Wait for confirmation (or proceed if I say “go ahead”).

Do **not** write code before this summary step.

---

## 🧱 Backend Requirements (FastAPI, Flat Files Only)

Follow the backend section of the spec precisely.

### Hard Constraints

- **No database**:  
  - Use only **JSON** and **NDJSON** files under `data/`.  
  - No SQLAlchemy, no Postgres, no SQLite, no ORM.
- Evidence artifacts (markdown + ZIP) must live under `artifacts/`.
- Domain: **Insurance AI** only (P&C / Commercial).

### Project Structure (Backend)

Create a backend folder, for example:

```text
backend/
  app/
    __init__.py
    main.py
    models.py          # Pydantic schemas
    storage.py         # flat-file read/write helpers
    routes/
      models.py
      controls.py
      evaluations.py   # explainability, drift, bias, RAG, risk
      philosophy.py
      evidence_packs.py
      audit_log.py
    services/
      risk_scoring_service.py
      evidence_pack_service.py
      philosophy_llm_service.py
  data/
    models.json
    controls.json
    lineage.ndjson
    control_evaluations.ndjson
    explainability.ndjson
    drift.ndjson
    bias.ndjson
    rag_evaluations.ndjson
    risk_assessments.ndjson
    governance_philosophy.ndjson
    evidence_packs.ndjson
    audit_log.ndjson
  artifacts/
    evidence_packs/
  Dockerfile
  requirements.txt
  README.md
```

You may adjust names slightly if needed, but keep this spirit.

### Storage Layer

Implement robust helpers in `storage.py`:

- JSON arrays:
  - Load from file path, return list.
  - Save list to file (with atomic temp-write-then-rename).
- NDJSON:
  - Append entries.
  - Read entries, optionally with filters.

### Endpoints

Implement **all endpoints** described in the spec under `/api/v1`, including:

- **Models & Lineage**
  - `POST /api/v1/models`
  - `GET  /api/v1/models`
  - `GET  /api/v1/models/{model_id}`
  - `POST /api/v1/models/{model_id}/lineage`

- **Controls & Evaluations**
  - `GET  /api/v1/controls`
  - `POST /api/v1/models/{model_id}/controls/evaluations`

- **Evaluations & Summary**
  - `POST /api/v1/models/{model_id}/explainability`
  - `POST /api/v1/models/{model_id}/drift`
  - `POST /api/v1/models/{model_id}/bias`
  - `POST /api/v1/models/{model_id}/rag-evaluations`
  - `POST /api/v1/models/{model_id}/risk-assessments`
  - `GET  /api/v1/models/{model_id}/governance-summary`

- **Governance Philosophy**
  - `POST /api/v1/governance/philosophy`
  - `GET  /api/v1/governance/philosophy`

- **Evidence Packs**
  - `POST /api/v1/models/{model_id}/evidence-packs`
  - `GET  /api/v1/evidence-packs/{evidence_pack_id}/download`

- **Audit Log**
  - `GET /api/v1/audit-log`

Use Pydantic models that match the spec’s fields, especially insurance-specific ones (LoB, jurisdictions, external_data_sources, unfair discrimination attributes, etc.).

### Services

- `risk_scoring_service.py` – implements the scoring logic described in the spec (weights from bias, explainability, controls, operations).
- `evidence_pack_service.py` – collects model data and evaluations, generates markdown files and ZIP.
- `philosophy_llm_service.py` – optionally fills in governance philosophy sections using an LLM if `OPENAI_API_KEY` is set. If not set, leave content as manually provided.

### Docker & Config

- `requirements.txt` – include FastAPI, Uvicorn, and any utilities needed.
- `Dockerfile` – run `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- Use env vars:
  - `GOV_APP_DATA_DIR`
  - `GOV_APP_ARTIFACTS_DIR`
  - `OPENAI_API_KEY` (optional)

Enable CORS for the frontend origin.

---

## 🎨 Frontend Requirements (Next.js React)

Follow the frontend section of the spec.

### Tech Stack

- Next.js (TypeScript preferred).
- Tailwind CSS.
- Use `NEXT_PUBLIC_API_BASE_URL` to talk to the FastAPI backend.

### Project Structure (Frontend)

Create a frontend folder, for example:

```text
frontend/
  app/ or pages/       # depending on Next.js routing style
  components/
    Layout.tsx
    Sidebar.tsx
    Header.tsx
    ModelTable.tsx
    Tabs.tsx
    Forms/...
  styles/
    globals.css
  tailwind.config.js
  postcss.config.js
  next.config.js
  package.json
  README.md
```

You can choose App Router or Pages Router, but keep the routes as defined in the spec:

- `/` – Dashboard
- `/models`
- `/models/new`
- `/models/[model_id]`
- `/governance/philosophy`
- `/evidence-packs`
- `/audit-log`

### Pages & Behaviors

Implement pages exactly as described:

- Dashboard with KPIs and a model risk overview.
- Model list with filters and basic actions.
- New model form mapped to `POST /models`.
- Model detail with tabs:
  - Overview
  - Lineage
  - Controls & Evaluations
  - Explainability & Bias
  - RAG & Drift
  - Risk & Evidence
- Governance philosophy editor using `GET`/`POST /governance/philosophy`.
- Evidence pack list with download links.
- Audit log viewer with filters.

Use clean, minimal Tailwind-based styling (cards, tables, badges, buttons).

---

## 🧪 Workflow & Expectations

1. **First:** Read and summarize `ai-governance-insurance-fullstack-spec.md`.
2. **Then scaffold:**
   - Backend directory + FastAPI skeleton.
   - Frontend directory + Next.js skeleton.
3. Implement storage helpers.
4. Implement backend endpoints and services.
5. Implement frontend pages against the real API.
6. At each major step, briefly explain what you have implemented.

Do **not** introduce any database. All data must be stored in flat files (JSON / NDJSON) under `data/`, with artifacts under `artifacts/`.

Start by reading the spec file now and summarizing your understanding before writing code.
