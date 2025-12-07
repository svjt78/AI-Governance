"""Evidence pack generator service"""
import os
import zipfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from app.models.evidence_pack import EvidencePack
from app.storage.json_storage import JSONStorage
from app.storage.ndjson_storage import NDJSONStorage
from app.config import settings


class EvidencePackGenerator:
    """Generate audit-ready evidence packs with separate markdown files"""

    @staticmethod
    def generate_evidence_pack(model_id: str, created_by: str) -> EvidencePack:
        """Generate complete evidence pack for a model"""
        # Load model
        models_file = os.path.join(settings.data_dir, "models.json")
        model = JSONStorage.find_by_id(models_file, "model_id", model_id)

        if not model:
            raise ValueError(f"Model {model_id} not found")

        # Create evidence pack metadata
        evidence_pack = EvidencePack(
            model_id=model_id,
            created_by=created_by,
            jurisdictions_covered=model.get("jurisdictions", []),
            included_sections=[
                "model", "lineage", "controls", "explainability",
                "bias", "drift", "rag", "risk", "philosophy", "audit_summary"
            ]
        )

        # Create directory for this pack
        pack_dir = Path(settings.artifacts_dir) / "evidence_packs" / evidence_pack.evidence_pack_id
        pack_dir.mkdir(parents=True, exist_ok=True)

        # Generate all markdown files
        EvidencePackGenerator._generate_model_md(model, pack_dir)
        EvidencePackGenerator._generate_lineage_md(model_id, pack_dir)
        EvidencePackGenerator._generate_controls_md(model_id, pack_dir)
        EvidencePackGenerator._generate_explainability_md(model_id, pack_dir)
        EvidencePackGenerator._generate_bias_md(model_id, pack_dir)
        EvidencePackGenerator._generate_drift_md(model_id, pack_dir)
        EvidencePackGenerator._generate_rag_md(model_id, pack_dir)
        EvidencePackGenerator._generate_risk_md(model_id, pack_dir)
        EvidencePackGenerator._generate_philosophy_md(model, pack_dir)
        EvidencePackGenerator._generate_audit_summary_md(model_id, pack_dir)

        # Create ZIP archive
        zip_path = pack_dir / "evidence_pack.zip"
        EvidencePackGenerator._create_zip(pack_dir, zip_path)

        evidence_pack.zip_path = str(zip_path)

        return evidence_pack

    @staticmethod
    def _generate_model_md(model: Dict[str, Any], pack_dir: Path) -> None:
        """Generate model details markdown"""
        content = f"""# AI Model Details

## Basic Information

- **Model ID**: {model.get('model_id')}
- **Name**: {model.get('name')}
- **Version**: {model.get('version')}
- **Model Type**: {model.get('model_type')}

## Insurance Context

- **Business Domain**: {model.get('business_domain')}
- **Line of Business**: {model.get('line_of_business')}
- **Use Case Category**: {model.get('use_case_category')}
- **Detailed Use Case**: {model.get('detailed_use_case')}

## Ownership & Program

- **Owner Team**: {model.get('owner_team')}
- **Product/Program**: {model.get('product_or_program')}

## Deployment

- **Environment**: {model.get('deployment_environment')}
- **Jurisdictions**: {', '.join(model.get('jurisdictions', []))}
- **Governance Status**: {model.get('governance_status')}

## External Data Sources

{chr(10).join(f'- {source}' for source in model.get('external_data_sources', []))}

## Deployment Details

```json
{model.get('deployment_details', {})}
```

---
*Generated: {datetime.utcnow().isoformat()}*
"""
        (pack_dir / "model.md").write_text(content)

    @staticmethod
    def _generate_lineage_md(model_id: str, pack_dir: Path) -> None:
        """Generate lineage markdown"""
        lineage_file = os.path.join(settings.data_dir, "lineage.ndjson")
        lineage_entries = NDJSONStorage.get_all_for_model(lineage_file, model_id, sort_by="timestamp")

        content = f"""# Model Lineage

## Lineage Snapshots

Total snapshots: {len(lineage_entries)}

"""
        for i, entry in enumerate(lineage_entries, 1):
            content += f"""### Snapshot {i}: {entry.get('timestamp')}

**Data Sources:**
{chr(10).join(f'- {source}' for source in entry.get('data_sources', []))}

**External Data Sources:**
{chr(10).join(f'- {source}' for source in entry.get('external_data_sources', []))}

**Training Pipeline:** {entry.get('training_pipeline', 'N/A')}

**Feature Store References:**
{chr(10).join(f'- {ref}' for ref in entry.get('feature_store_refs', []))}

**Deployment:**
```json
{entry.get('deployment', {})}
```

---

"""
        (pack_dir / "lineage.md").write_text(content)

    @staticmethod
    def _generate_controls_md(model_id: str, pack_dir: Path) -> None:
        """Generate controls evaluation markdown"""
        controls_file = os.path.join(settings.data_dir, "controls.json")
        eval_file = os.path.join(settings.data_dir, "control_evaluations.ndjson")

        controls = JSONStorage.load_json(controls_file)
        evaluations = NDJSONStorage.get_all_for_model(eval_file, model_id)

        # Create evaluation lookup
        eval_map = {e.get('control_id'): e for e in evaluations}

        content = f"""# Governance Controls & Evaluations

## Control Evaluation Summary

- Total Controls: {len(controls)}
- Evaluated: {len(evaluations)}
- Passed: {len([e for e in evaluations if e.get('status') == 'passed'])}
- Failed: {len([e for e in evaluations if e.get('status') == 'failed'])}
- Needs Review: {len([e for e in evaluations if e.get('status') == 'needs_review'])}

## Detailed Evaluations

"""
        for control in controls:
            control_id = control.get('control_id')
            evaluation = eval_map.get(control_id)

            content += f"""### {control_id}: {control.get('regulatory_focus')}

**Framework**: {control.get('framework_reference')}
**Category**: {control.get('category')}
**Mandatory for Prod**: {control.get('mandatory_for_prod')}

**Description**: {control.get('description')}

**Evaluation Status**: {evaluation.get('status') if evaluation else 'NOT EVALUATED'}

"""
            if evaluation:
                content += f"""**Rationale**: {evaluation.get('rationale')}
**Last Updated**: {evaluation.get('last_updated')}

"""
            content += "---\n\n"

        (pack_dir / "controls.md").write_text(content)

    @staticmethod
    def _generate_explainability_md(model_id: str, pack_dir: Path) -> None:
        """Generate explainability markdown"""
        explain_file = os.path.join(settings.data_dir, "explainability.ndjson")
        evaluations = NDJSONStorage.get_all_for_model(explain_file, model_id, sort_by="timestamp")

        content = f"""# Explainability Evaluations

Total evaluations: {len(evaluations)}

"""
        for i, eval in enumerate(evaluations, 1):
            content += f"""## Evaluation {i}: {eval.get('decision_context')}

**Method**: {eval.get('method')}
**Timestamp**: {eval.get('timestamp')}
**Explainability Score**: {eval.get('explainability_score', 'N/A')}
**Suitable for Customer Communication**: {eval.get('suitable_for_customer_communication')}

**Summary**: {eval.get('summary')}

**Key Findings**:
{chr(10).join(f'- {finding}' for finding in eval.get('key_findings', []))}

**Limitations**: {eval.get('limitations')}

---

"""
        (pack_dir / "explainability.md").write_text(content)

    @staticmethod
    def _generate_bias_md(model_id: str, pack_dir: Path) -> None:
        """Generate bias/unfair discrimination markdown"""
        bias_file = os.path.join(settings.data_dir, "bias.ndjson")
        evaluations = NDJSONStorage.get_all_for_model(bias_file, model_id, sort_by="timestamp")

        content = f"""# Bias & Unfair Discrimination Testing

Total tests: {len(evaluations)}

"""
        for i, eval in enumerate(evaluations, 1):
            content += f"""## Test {i}: {eval.get('test_scope')}

**Protected/Prohibited Factor**: {eval.get('protected_or_prohibited_factor')}
**Test Type**: {eval.get('test_type')}
**Metric**: {eval.get('metric')}
**Value**: {eval.get('value')}
**Threshold**: {eval.get('threshold')}
**Status**: {eval.get('status')}
**Customer Harm Risk**: {eval.get('customer_harm_risk')}
**Regulatory Concern Flag**: {eval.get('regulatory_concern_flag')}

**Mitigation Plan**: {eval.get('mitigation_plan', 'None')}

---

"""
        (pack_dir / "bias.md").write_text(content)

    @staticmethod
    def _generate_drift_md(model_id: str, pack_dir: Path) -> None:
        """Generate drift monitoring markdown"""
        drift_file = os.path.join(settings.data_dir, "drift.ndjson")
        evaluations = NDJSONStorage.get_all_for_model(drift_file, model_id, sort_by="timestamp")

        content = f"""# Drift Monitoring

Total drift evaluations: {len(evaluations)}

"""
        for i, eval in enumerate(evaluations, 1):
            content += f"""## Evaluation {i}: {eval.get('drift_type')} Drift

**Metric**: {eval.get('metric')}
**Value**: {eval.get('value')}
**Threshold**: {eval.get('threshold')}
**Status**: {eval.get('status')}
**Observation Window**: {eval.get('observation_window')}

**Insurance Impact**: {eval.get('insurance_impact_summary')}

**Notes**: {eval.get('notes')}

---

"""
        (pack_dir / "drift.md").write_text(content)

    @staticmethod
    def _generate_rag_md(model_id: str, pack_dir: Path) -> None:
        """Generate RAG evaluation markdown"""
        rag_file = os.path.join(settings.data_dir, "rag_evaluations.ndjson")
        evaluations = NDJSONStorage.get_all_for_model(rag_file, model_id, sort_by="timestamp")

        content = f"""# RAG Evaluations (Insurance Copilots)

Total evaluations: {len(evaluations)}

"""
        if not evaluations:
            content += "\n*No RAG evaluations (model may not be a RAG-based copilot)*\n"
        else:
            for i, eval in enumerate(evaluations, 1):
                content += f"""## Evaluation {i}: Batch {eval.get('eval_batch_id')}

**Grounding Score**: {eval.get('grounding_score')}
**Hallucination Rate**: {eval.get('hallucination_rate')}
**Context Relevance Score**: {eval.get('context_relevance_score')}
**Method**: {eval.get('method')}
**Coverage Misstatement Flag**: {eval.get('coverage_misstatement_flag')}

**Summary**: {eval.get('summary')}

**Notes**: {eval.get('notes')}

---

"""
        (pack_dir / "rag.md").write_text(content)

    @staticmethod
    def _generate_risk_md(model_id: str, pack_dir: Path) -> None:
        """Generate risk assessment markdown"""
        risk_file = os.path.join(settings.data_dir, "risk_assessments.ndjson")
        assessments = NDJSONStorage.get_all_for_model(risk_file, model_id, sort_by="timestamp")

        content = f"""# Risk Assessments

Total assessments: {len(assessments)}

"""
        for i, assessment in enumerate(assessments, 1):
            content += f"""## Assessment {i}

**Risk Score**: {assessment.get('risk_score')}/100
**Risk Level**: {assessment.get('risk_level')}
**Timestamp**: {assessment.get('timestamp')}

**Primary Risk Drivers**:
{chr(10).join(f'- {driver}' for driver in assessment.get('primary_risk_drivers', []))}

**Business Impact Summary**: {assessment.get('business_impact_summary')}

**Mitigation Plan**: {assessment.get('mitigation_plan', 'None')}

**Residual Risk Accepted**: {assessment.get('residual_risk_accepted')}
**Residual Risk Approver**: {assessment.get('residual_risk_approver', 'N/A')}

---

"""
        (pack_dir / "risk.md").write_text(content)

    @staticmethod
    def _generate_philosophy_md(model: Dict[str, Any], pack_dir: Path) -> None:
        """Generate governance philosophy markdown"""
        philosophy_file = os.path.join(settings.data_dir, "governance_philosophy.ndjson")
        all_philosophies = NDJSONStorage.read_all(philosophy_file)

        # Find applicable philosophies (org, domain, LoB, model-specific)
        model_id = model.get('model_id')
        lob = model.get('line_of_business')
        domain = model.get('business_domain')

        relevant = [
            p for p in all_philosophies
            if p.get('scope_ref') in ['enterprise', domain, lob, model_id]
        ]

        content = f"""# Governance Philosophy

Applicable philosophies: {len(relevant)}

"""
        for philosophy in relevant:
            content += f"""## {philosophy.get('scope')} Level: {philosophy.get('scope_ref')}

### Risk Appetite
{philosophy.get('risk_appetite', 'Not specified')}

### Fairness & Unfair Discrimination Principles
{philosophy.get('fairness_and_unfair_discrimination_principles', 'Not specified')}

### External Data & Vendor Controls
{philosophy.get('external_data_and_vendor_controls', 'Not specified')}

### Regulatory Alignment Principles
{philosophy.get('regulatory_alignment_principles', 'Not specified')}

### Safety & Customer Protection Principles
{philosophy.get('safety_and_customer_protection_principles', 'Not specified')}

### Explainability & Customer Communication
{philosophy.get('explainability_and_customer_communication', 'Not specified')}

### Auditability & DOI Exam Readiness
{philosophy.get('auditability_and_DOI_exam_readiness', 'Not specified')}

### Lifecycle Governance
{philosophy.get('lifecycle_governance', 'Not specified')}

**Generated by LLM**: {philosophy.get('generated_by_llm')}

---

"""
        (pack_dir / "philosophy.md").write_text(content)

    @staticmethod
    def _generate_audit_summary_md(model_id: str, pack_dir: Path) -> None:
        """Generate audit log summary markdown"""
        audit_file = os.path.join(settings.data_dir, "audit_log.ndjson")
        logs = NDJSONStorage.filter_records(audit_file, model_id=model_id)

        # Sort by timestamp descending
        logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

        # Take last 50 entries
        logs = logs[:50]

        content = f"""# Audit Log Summary

Recent audit events for this model: {len(logs)}

"""
        for log in logs:
            content += f"""- **{log.get('timestamp')}** - {log.get('action_type')} by {log.get('user_id')} on {log.get('entity_type')} ({log.get('entity_id')})
"""

        (pack_dir / "audit_summary.md").write_text(content)

    @staticmethod
    def _create_zip(pack_dir: Path, zip_path: Path) -> None:
        """Create ZIP archive of all markdown files"""
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for md_file in pack_dir.glob('*.md'):
                zipf.write(md_file, arcname=md_file.name)
