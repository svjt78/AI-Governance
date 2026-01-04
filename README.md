# InsureGov AI Governance

A comprehensive AI governance platform specifically designed for Property & Casualty and Commercial Insurance companies to ensure compliance with NAIC AI Principles, state Department of Insurance (DOI) regulations, and industry best practices.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Application Structure](#application-structure)
- [Sample Data](#sample-data)
- [API Documentation](#api-documentation)
- [Features in Detail](#features-in-detail)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Insurance Domain Context](#insurance-domain-context)

## Overview

InsureGov provides a complete governance framework for AI models used in insurance operations including pricing, underwriting, claims processing, fraud detection, and operational copilots. The platform helps insurance companies:

- Demonstrate compliance with NAIC AI Principles and state DOI requirements
- Prevent unfair discrimination in automated decision-making
- Maintain comprehensive audit trails for regulatory examinations
- Generate audit-ready documentation packages
- Monitor model performance and detect drift
- Assess and mitigate AI-related risks

## Key Features

### Core Capabilities

- **AI Model Registry**: Centralized tracking of all AI models across business domains and lines of business
- **NAIC Compliance Framework**: 15 control framework based on NAIC AI Principles
- **Bias & Fairness Testing**: Comprehensive unfair discrimination testing and monitoring
- **Explainability Analysis**: Support for SHAP, LIME, prompt tracing, and agent tracing
- **Risk Scoring Engine**: Automated, insurance-specific weighted risk assessment
- **Evidence Pack Generation**: One-click audit-ready documentation for DOI examinations
- **Governance Philosophy**: Structured governance principles at org/domain/LOB/model levels
- **LLM-Assisted Governance**: GPT-powered philosophy generation with NAIC alignment
- **Data Lineage Tracking**: Complete data source and pipeline documentation
- **Comprehensive Audit Log**: Full mutation tracking with before/after values

### Supported Model Types

- **Traditional ML**: Classifiers, Regressors, Rules-based systems
- **Modern AI**: LLMs, RAG systems, Autonomous agents
- **Use Cases**: Pricing, Underwriting, Claims, Fraud Detection, Marketing, Customer Service, Operational Copilots

## Technology Stack

### Backend
- **Framework**: FastAPI 0.109.0 (Python 3.11)
- **Server**: Uvicorn with hot reload
- **Validation**: Pydantic 2.5.3
- **Storage**: Flat files (JSON/NDJSON) - No database required
- **LLM Integration**: OpenAI API 1.54.0 (GPT-3.5-turbo)
- **Dependencies**: httpx, aiofiles, python-multipart

### Frontend
- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3.3
- **UI Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React hooks (no Redux/Zustand)

### Infrastructure
- **Containerization**: Docker with multi-container orchestration
- **Development**: Hot reload for both frontend and backend
- **Networking**: Custom Docker network for service communication
- **Persistence**: Volume mounts for data and artifacts

## Quick Start

### Prerequisites

- Docker Desktop or Docker Engine + docker-compose
- OpenAI API key (required for LLM features)
- At least 2GB free disk space
- Ports 3006 and 8006 available

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd /path/to/InsureGov-AI
   ```

2. **Create or update the .env file** with your OpenAI API key:
   ```bash
   # Create .env file if it doesn't exist
   cat > .env << EOF
   OPENAI_API_KEY=your-actual-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   GOV_APP_DATA_DIR=/app/data
   GOV_APP_ARTIFACTS_DIR=/app/artifacts
   CORS_ORIGINS=http://localhost:3006
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8006/api/v1
   EOF
   ```

3. **Build and start the application**:
   ```bash
   docker-compose up --build
   ```

   Wait for the startup messages:
   ```
   insuregov-backend   | INFO:     Uvicorn running on http://0.0.0.0:8006
   insuregov-frontend  | ✓ Ready in 2.5s
   ```

4. **Generate seed data** (in a new terminal):
   ```bash
   docker exec -it insuregov-backend python scripts/seed_data.py
   ```

   This creates 5 realistic insurance models with complete governance data.

5. **Access the application**:
   - **Frontend UI**: http://localhost:3006
   - **Backend API**: http://localhost:8006
   - **API Docs (Swagger)**: http://localhost:8006/docs
   - **Health Check**: http://localhost:8006/health

### Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (resets all data)
docker-compose down -v
```

## Application Structure

```
InsureGov-AI/
├── backend/                          # FastAPI backend application
│   ├── app/
│   │   ├── models/                   # Pydantic data models (11 files)
│   │   │   ├── insurance_model.py    # Core model entity
│   │   │   ├── controls.py           # Control framework
│   │   │   ├── bias.py               # Bias evaluation model
│   │   │   ├── drift.py              # Drift monitoring model
│   │   │   ├── explainability.py     # Explainability model
│   │   │   ├── risk.py               # Risk assessment model
│   │   │   ├── rag.py                # RAG evaluation model
│   │   │   ├── lineage.py            # Data lineage model
│   │   │   ├── philosophy.py         # Governance philosophy model
│   │   │   ├── evidence_pack.py      # Evidence pack metadata
│   │   │   └── audit_log.py          # Audit log entry
│   │   ├── routes/                   # API endpoints (6 files)
│   │   │   ├── models.py             # Model registry endpoints
│   │   │   ├── controls.py           # Control evaluation endpoints
│   │   │   ├── evaluations.py        # All evaluation endpoints
│   │   │   ├── philosophy.py         # Governance philosophy endpoints
│   │   │   ├── evidence_packs.py     # Evidence pack endpoints
│   │   │   └── audit_log.py          # Audit log endpoints
│   │   ├── services/                 # Business logic layer
│   │   │   ├── risk_scoring.py       # Risk calculation engine
│   │   │   ├── evidence_pack_generator.py  # Documentation generator
│   │   │   ├── philosophy_llm.py     # LLM integration service
│   │   │   └── audit_logger.py       # Audit logging service
│   │   ├── storage/                  # Data persistence layer
│   │   │   ├── json_storage.py       # Atomic JSON operations
│   │   │   └── ndjson_storage.py     # Append-only NDJSON storage
│   │   ├── config.py                 # Application configuration
│   │   └── main.py                   # FastAPI application entry
│   ├── data/                         # Persistent data files
│   │   ├── models.json               # Model registry
│   │   ├── controls.json             # 15 NAIC controls
│   │   │                             # Includes accountability owner per control
│   │   ├── control_evaluations.ndjson
│   │   ├── bias.ndjson
│   │   ├── drift.ndjson
│   │   ├── explainability.ndjson
│   │   ├── risk_assessments.ndjson
│   │   ├── rag_evaluations.ndjson
│   │   ├── lineage.ndjson
│   │   ├── governance_philosophy.ndjson
│   │   ├── evidence_packs.ndjson
│   │   ├── audit_log.ndjson
│   │   └── temp/                     # Temporary files (philosophy downloads, etc.)
│   ├── artifacts/                    # Generated evidence packs
│   │   └── evidence_packs/           # ZIP files for download
│   ├── scripts/
│   │   └── seed_data.py              # Sample data generator
│   ├── requirements.txt              # Python dependencies
│   └── Dockerfile
│
├── frontend/                         # Next.js frontend application
│   ├── src/
│   │   ├── app/                      # Next.js pages (App Router)
│   │   │   ├── page.tsx              # Dashboard homepage
│   │   │   ├── models/
│   │   │   │   ├── page.tsx          # Model registry list
│   │   │   │   ├── new/page.tsx      # Model registration form
│   │   │   │   └── [model_id]/page.tsx  # Model detail page
│   │   │   ├── governance/
│   │   │   │   └── philosophy/page.tsx  # Philosophy editor
│   │   │   ├── controls/             # Control catalog management
│   │   │   ├── evidence-packs/page.tsx  # Evidence pack browser
│   │   │   ├── audit-log/page.tsx       # Audit log viewer
│   │   │   └── layout.tsx            # Root layout with sidebar
│   │   ├── components/               # React components
│   │   │   ├── evaluations/          # Evaluation forms (5 files)
│   │   │   │   ├── BiasEvaluationForm.tsx
│   │   │   │   ├── ControlEvaluationForm.tsx
│   │   │   │   ├── DriftEvaluationForm.tsx
│   │   │   │   ├── ExplainabilityForm.tsx
│   │   │   │   └── RiskAssessmentForm.tsx
│   │   │   ├── common/               # Reusable UI components
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── Tabs.tsx
│   │   │   └── layout/
│   │   │       └── Sidebar.tsx       # Navigation sidebar
│   │   ├── lib/                      # Utilities and API client
│   │   │   ├── api.ts                # Typed API client
│   │   │   └── types.ts              # TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css           # Tailwind imports
│   ├── package.json                  # Node dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── next.config.js                # Next.js configuration
│   └── Dockerfile
│
├── .env                              # Environment variables (shared)
├── docker-compose.yml                # Container orchestration
├── README.md                         # This file
└── CLAUDE.md                         # Developer documentation
```

## Sample Data

The seed data script (`scripts/seed_data.py`) generates realistic insurance AI models with complete governance data.

### 5 Insurance AI Models

#### 1. Personal Auto Pricing Model
- **Type**: Regressor (Traditional ML)
- **Status**: Production (Approved)
- **Risk Level**: Medium (35.5/100)
- **Line of Business**: Personal Auto
- **Use Case**: Premium rating for new business and renewals
- **Jurisdictions**: WI, MN, IL, IN, OH (5 states)
- **External Data**: Credit-based insurance score, telematics, LexisNexis claims
- **Features**: 13 controls passed, 2 N/A; explainability via SHAP; no bias concerns

#### 2. Homeowners Underwriting RAG Copilot
- **Type**: RAG (Retrieval Augmented Generation)
- **Status**: Testing (Under Review)
- **Risk Level**: Low (22.3/100)
- **Line of Business**: Homeowners
- **Use Case**: Operational copilot for underwriter decision support
- **Jurisdictions**: CA, TX, FL, AZ, NV (5 states)
- **External Data**: Wildfire risk scores, flood zone data, ISO scores
- **Features**: RAG evaluation metrics; hallucination prevention; coverage accuracy checks

#### 3. Workers Comp Claims Fraud Detector
- **Type**: Classifier (Traditional ML)
- **Status**: Production (Approved)
- **Risk Level**: High (76.2/100)
- **Line of Business**: Workers Compensation
- **Use Case**: Fraud detection in claims processing
- **Jurisdictions**: NY, NJ, PA, MA, CT (5 states)
- **External Data**: SIU historical data, medical provider networks
- **Features**: **Drift threshold breached** - requires attention; all controls passed

#### 4. Commercial Auto Underwriting Agent
- **Type**: Autonomous Agent (LLM-based)
- **Status**: Development (Draft)
- **Risk Level**: Medium (52.1/100)
- **Line of Business**: Commercial Auto
- **Use Case**: Automated underwriting decisions for fleet policies
- **Jurisdictions**: TX, OH, MI, GA, NC (5 states)
- **External Data**: Fleet telematics, FMCSA data, DOT compliance
- **Features**: Agent trace explainability; in development phase

#### 5. Small Commercial Property Pricing Model
- **Type**: Regressor (Traditional ML)
- **Status**: **SUSPENDED** (Temporarily Suspended)
- **Risk Level**: **CRITICAL** (88.95/100)
- **Line of Business**: Property (Commercial)
- **Use Case**: Premium calculation for small commercial properties
- **Jurisdictions**: CA, WA, OR, AZ, NV, UT, ID, MT (8 states)
- **External Data**: Catastrophe models, property valuation data
- **Features**: **UNFAIR DISCRIMINATION DETECTED** - regulatory concern flagged; immediate remediation required

### NAIC-Based Control Framework

15 insurance-specific controls including:

**Core NAIC Controls:**
1. **NAIC-AI-01**: Unfair Discrimination Prevention & Protected Class Analysis
2. **NAIC-AI-02**: External Data Governance (Third-party data sources)
3. **NAIC-AI-03**: Consumer Transparency & Notification Requirements
4. **NAIC-AI-04**: Model Documentation for DOI Examination
5. **NAIC-AI-05**: Data Governance & Lineage
6. **NAIC-AI-06**: Model Validation & Testing (Pre-deployment)
7. **NAIC-AI-07**: Ongoing Model Monitoring
8. **NAIC-AI-08**: Third-party Vendor Risk Management
9. **NAIC-AI-09**: Adverse Action & Explainability Procedures
10. **NAIC-AI-10**: Consumer Privacy & Data Protection

**RAG & LLM-Specific Controls:**
11. **RAG-01**: RAG Hallucination Prevention (Grounding & citation mechanisms)
12. **RAG-02**: Coverage Accuracy Validation (AI-generated policy explanations)

**Fairness & Bias Controls:**
13. **FAIR-01**: Proxy Discrimination Testing (ZIP code, etc.)
14. **FAIR-02**: Disparate Impact Analysis

**Explainability Controls:**
15. **XAI-01**: Technical Explainability (SHAP/LIME)

## API Documentation

### Base URL
```
http://localhost:8006/api/v1
```

### Interactive API Documentation
- **Swagger UI**: http://localhost:8006/docs
- **ReDoc**: http://localhost:8006/redoc

### Key Endpoints

#### Model Registry
```http
POST   /models                          # Register new AI model
GET    /models                          # List models (with filters)
GET    /models/{model_id}               # Get model details
POST   /models/{model_id}/lineage       # Add data lineage snapshot
GET    /models/{model_id}/lineage       # Get lineage history
GET    /models/{model_id}/governance-summary  # Get comprehensive governance summary
```

#### Controls
```http
GET    /controls                                    # Get 15-control catalog
GET    /controls/{control_id}                       # Get control details
POST   /controls                                    # Create control (includes accountability)
PUT    /controls/{control_id}                       # Update control
DELETE /controls/{control_id}                       # Delete control
POST   /models/{model_id}/controls/evaluations     # Update control evaluations
GET    /models/{model_id}/controls/evaluations     # Get model's control evaluations
```

#### Evaluations
```http
POST   /models/{model_id}/explainability           # Add explainability evaluation
GET    /models/{model_id}/explainability           # List explainability evaluations
POST   /models/{model_id}/drift                    # Add drift monitoring evaluation
GET    /models/{model_id}/drift                    # List drift evaluations
POST   /models/{model_id}/bias                     # Add bias/discrimination test
GET    /models/{model_id}/bias                     # List bias evaluations
POST   /models/{model_id}/rag-evaluations          # Add RAG copilot evaluation
GET    /models/{model_id}/rag-evaluations          # List RAG evaluations
POST   /models/{model_id}/risk-assessments         # Add risk assessment
GET    /models/{model_id}/risk-assessments         # List risk assessments
```

#### Governance Philosophy
```http
POST   /governance/philosophy?use_llm_to_fill_gaps=true    # Create/update with LLM assistance
GET    /governance/philosophy?scope={scope}&scope_ref={ref}  # Get philosophies (filtered)
GET    /governance/philosophy/download?scope={scope}&scope_ref={ref}  # Download as markdown file
DELETE /governance/philosophy?scope={scope}&scope_ref={ref}  # Delete philosophy entry
```

#### Evidence Packs
```http
POST   /models/{model_id}/evidence-packs?created_by={user}  # Generate evidence pack ZIP
GET    /evidence-packs                              # List all evidence packs
GET    /evidence-packs/{pack_id}/download           # Download ZIP archive
```

#### Audit Log
```http
GET    /audit-log?model_id={id}&entity_type={type}&action_type={action}&limit={n}  # Get audit log
```

## Features in Detail

### Risk Scoring Engine

The platform calculates insurance-specific risk scores using weighted factors:

**Risk Score Formula** (0-100 scale):
```
Total Risk =
  (Bias/Discrimination × 40%) +
  (Control Failures × 25%) +
  (Explainability Gaps × 20%) +
  (Drift Issues × 10%) +
  (Operational Factors × 5%)
```

**Risk Levels**:
- **Low** (0-29): Minimal governance concerns
- **Medium** (30-59): Standard monitoring required
- **High** (60-79): Enhanced oversight needed
- **Critical** (80-100): Immediate action required

**Primary Risk Drivers** automatically identified:
- Unfair discrimination detected
- Regulatory concern flagged
- Drift threshold breached
- Control evaluation failures
- Explainability gaps
- Incomplete control evaluations
- Production deployment factors

### Evidence Pack Generation

Generates audit-ready documentation packages containing 10 separate markdown files:

1. **model.md** - Model metadata, business context, deployment details
2. **lineage.md** - Complete data lineage and training pipeline history
3. **controls.md** - Control catalog and evaluation results (15 controls)
4. **explainability.md** - Explainability assessments (SHAP, LIME, traces)
5. **bias.md** - Unfair discrimination testing results
6. **drift.md** - Model drift monitoring history
7. **rag.md** - RAG evaluation metrics (if applicable)
8. **risk.md** - Risk assessment history and scores
9. **philosophy.md** - Applicable governance philosophies
10. **audit_summary.md** - Audit log for the model

All files are packaged as a ZIP archive with timestamp for regulatory submission.

### LLM-Assisted Governance Philosophy

When creating or updating governance philosophy, enable "Use AI to complete missing sections" to leverage GPT-3.5-turbo for:

- **Insurance-Specific Guidance**: Tailored recommendations for P&C and Commercial Insurance
- **NAIC Alignment**: References to NAIC AI Principles and regulatory requirements
- **Unfair Discrimination Focus**: Comprehensive fairness and discrimination prevention guidance
- **DOI Readiness**: Practical guidance for state DOI examinations
- **Actionable Recommendations**: Specific, implementable governance practices

**Philosophy Sections**:
- Risk Appetite Statement
- Fairness Principles
- External Data Controls
- Regulatory Alignment
- Safety Principles
- Explainability Requirements
- Auditability Standards
- Lifecycle Governance

**Scope Levels**:
- **Organization**: Enterprise-wide principles
- **Business Domain**: P&C Personal, P&C Commercial, Reinsurance, Specialty
- **Line of Business**: Personal Auto, Homeowners, Workers Comp, etc.
- **Model**: Model-specific governance

**Management Features**:
- **Download as Markdown**: Export any philosophy as a formatted markdown file for documentation
- **Delete**: Remove outdated or incorrect philosophy entries
- **Version History**: All philosophies are timestamped with creation and update dates

### Data Lineage Tracking

Comprehensive lineage tracking includes:

- **Data Sources**: All datasets used (internal, external, third-party)
- **Pipeline Snapshots**: Training pipeline configurations and versions
- **Training Metadata**: Dates, model versions, performance metrics
- **External Data Vendors**: Credit bureaus, catastrophe modelers, etc.
- **Change History**: Complete audit trail of lineage changes

### Audit Logging

Every mutation is logged with:
- User ID performing the action
- Action type (create, update, evaluate, generate, etc.)
- Entity type (model, control, evaluation, etc.)
- Entity ID (model_id, control_id, etc.)
- Old value (before change)
- New value (after change)
- Timestamp (ISO 8601 format)

Supports filtering by model, entity type, action type, and date range.

## Development

### Running in Development Mode

Both frontend and backend support hot reload:

```bash
# Start in development mode (default)
docker-compose up

# View backend logs
docker logs -f insuregov-backend

# View frontend logs
docker logs -f insuregov-frontend
```

**Hot Reload Behavior**:
- **Backend**: Python file changes trigger automatic Uvicorn reload
- **Frontend**: TypeScript/React changes trigger Next.js fast refresh

### Generating Fresh Seed Data

```bash
# Delete existing data
docker exec -it insuregov-backend rm -rf /app/data/*.json /app/data/*.ndjson

# Regenerate seed data
docker exec -it insuregov-backend python scripts/seed_data.py

# Verify data generation
docker exec -it insuregov-backend ls -lh /app/data/
```

### Accessing Container Shell

```bash
# Backend container
docker exec -it insuregov-backend /bin/bash

# Frontend container
docker exec -it insuregov-frontend /bin/sh
```

### Running Tests

```bash
# Backend tests (if available)
docker exec -it insuregov-backend pytest

# Frontend tests (if available)
docker exec -it insuregov-frontend npm test
```

### Building for Production

```bash
# Build production images
docker-compose build --no-cache

# Run in production mode
docker-compose -f docker-compose.prod.yml up
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required for LLM features) | `sk-proj-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` |
| `GOV_APP_DATA_DIR` | Backend data directory path | `/app/data` |
| `GOV_APP_ARTIFACTS_DIR` | Artifacts directory path | `/app/artifacts` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3006` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend API base URL | `http://localhost:8006/api/v1` |

## Troubleshooting

### Port Conflicts

If ports 3006 or 8006 are already in use:

```yaml
# Edit docker-compose.yml
services:
  backend:
    ports:
      - "8007:8006"  # Change external port
  frontend:
    ports:
      - "3007:3006"  # Change external port
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:8007/api/v1  # Update API URL
```

### Container Startup Issues

```bash
# View container logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

### Data Persistence Issues

```bash
# Verify volume mounts
docker inspect insuregov-backend | grep Mounts -A 20

# Check data directory permissions
docker exec -it insuregov-backend ls -la /app/data/

# Reset all data
rm -rf backend/data/*.json backend/data/*.ndjson backend/artifacts/evidence_packs/*
docker exec -it insuregov-backend python scripts/seed_data.py
```

### OpenAI API Issues

If LLM features aren't working:

1. **Verify API key**:
   ```bash
   docker exec -it insuregov-backend printenv OPENAI_API_KEY
   ```

2. **Check API key validity**: Test at https://platform.openai.com/api-keys

3. **Restart containers**:
   ```bash
   docker-compose down
   docker-compose up
   ```

4. **Check logs for API errors**:
   ```bash
   docker logs insuregov-backend | grep -i openai
   ```

### Frontend API Connection Issues

```bash
# Verify backend is running
curl http://localhost:8006/health

# Check API base URL in frontend
docker exec -it insuregov-frontend printenv NEXT_PUBLIC_API_BASE_URL

# Verify network connectivity
docker network inspect insuregov-network
```

## Insurance Domain Context

InsureGov is purpose-built for insurance industry AI governance:

### Lines of Business Supported
- **Personal Lines**: Personal Auto, Homeowners, Personal Umbrella, Renters
- **Commercial Lines**: Commercial Auto, Workers Compensation, General Liability, Commercial Property
- **Specialty**: Cyber, Professional Liability, Surety

### Insurance Use Cases
- **Pricing**: Premium calculation, rate optimization
- **Underwriting**: Risk selection, eligibility determination
- **Claims**: Fraud detection, claims triage, settlement estimation
- **Marketing**: Lead scoring, conversion prediction
- **Customer Service**: Chatbots, policy servicing copilots
- **Operations**: Underwriter copilots, claims adjuster assistants

### Regulatory Compliance
- **NAIC AI Principles**: Complete 15-control framework
- **State DOI Requirements**: Audit-ready documentation
- **Unfair Discrimination Laws**: Comprehensive bias testing
- **Consumer Protection**: Transparency and explainability
- **Privacy Regulations**: Data governance and protection

### External Data Sources
- Credit-based insurance scores
- Telematics and usage-based data
- Catastrophe model outputs
- Third-party risk scores
- Property and vehicle valuation data
- Claims databases (LexisNexis, ISO)
- Government data (FMCSA, DOT)

## Performance Considerations

- **Backend Response Time**: <100ms for most API calls
- **Evidence Pack Generation**: 2-5 seconds depending on model complexity
- **LLM Philosophy Generation**: 3-10 seconds per section
- **Data File Size**: ~1-10MB for typical models
- **Concurrent Users**: Supports 10-50 concurrent users (single instance)

## Security Considerations

- **No Database**: Reduces attack surface, no SQL injection risk
- **File Permissions**: Docker volumes with appropriate permissions
- **API Keys**: Environment variable storage, never committed to Git
- **CORS**: Configurable allowed origins
- **Audit Trail**: Complete logging of all mutations
- **Data Persistence**: Local file system, not exposed to network

## Future Enhancements

Potential areas for expansion:
- Authentication and user management
- Role-based access control (RBAC)
- Advanced analytics and dashboards
- Integration with model serving platforms
- Automated bias testing workflows
- Real-time drift monitoring alerts
- Multi-tenant support
- Cloud deployment (AWS/Azure/GCP)

## License

Proprietary - For demonstration and evaluation purposes only.

## Support

For issues, questions, or feature requests:
- Review the [CLAUDE.md](CLAUDE.md) developer documentation
- Check the API documentation at http://localhost:8006/docs
- Contact the AI Governance team

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintainer**: AI Governance Team
