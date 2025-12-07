"""Seed data generation script for realistic insurance AI models"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datetime import datetime, timedelta
import random

from app.models.insurance_model import InsuranceAIModel, ModelType, BusinessDomain, LineOfBusiness, UseCaseCategory, GovernanceStatus, DeploymentEnvironment
from app.models.lineage import LineageEntry
from app.models.controls import ControlEvaluation, ControlEvaluationStatus
from app.models.explainability import ExplainabilityEvaluation, ExplainabilityMethod
from app.models.drift import DriftEvaluation, DriftType, DriftStatus
from app.models.bias import BiasEvaluation, BiasTestStatus, CustomerHarmRisk
from app.models.rag import RAGEvaluation, RAGEvaluationMethod
from app.models.risk import RiskAssessment, RiskLevel
from app.models.philosophy import GovernancePhilosophy, PhilosophyScope
from app.storage.json_storage import JSONStorage
from app.storage.ndjson_storage import NDJSONStorage
from app.config import settings


def main():
    """Generate comprehensive seed data"""
    print("🌱 Generating seed data for InsureGov AI Governance...")

    # File paths
    models_file = os.path.join(settings.data_dir, "models.json")
    lineage_file = os.path.join(settings.data_dir, "lineage.ndjson")
    control_eval_file = os.path.join(settings.data_dir, "control_evaluations.ndjson")
    explainability_file = os.path.join(settings.data_dir, "explainability.ndjson")
    drift_file = os.path.join(settings.data_dir, "drift.ndjson")
    bias_file = os.path.join(settings.data_dir, "bias.ndjson")
    rag_file = os.path.join(settings.data_dir, "rag_evaluations.ndjson")
    risk_file = os.path.join(settings.data_dir, "risk_assessments.ndjson")
    philosophy_file = os.path.join(settings.data_dir, "governance_philosophy.ndjson")

    # Clear existing data
    for file_path in [models_file, lineage_file, control_eval_file, explainability_file,
                     drift_file, bias_file, rag_file, risk_file, philosophy_file]:
        if os.path.exists(file_path):
            os.remove(file_path)

    # Create 5 realistic insurance models
    models = create_insurance_models()
    for model in models:
        JSONStorage.create(models_file, model.model_dump(mode='json'))
        print(f"✓ Created model: {model.name}")

    # Create lineage for each model
    for model in models:
        lineage_entries = create_lineage_for_model(model)
        for entry in lineage_entries:
            NDJSONStorage.append(lineage_file, entry.model_dump(mode='json'))
        print(f"✓ Created {len(lineage_entries)} lineage entries for {model.name}")

    # Create control evaluations
    control_ids = get_control_ids()
    for model in models:
        evaluations = create_control_evaluations(model, control_ids)
        for evaluation in evaluations:
            NDJSONStorage.append(control_eval_file, evaluation.model_dump(mode='json'))
        print(f"✓ Created {len(evaluations)} control evaluations for {model.name}")

    # Create explainability evaluations
    for model in models:
        evaluations = create_explainability_evaluations(model)
        for evaluation in evaluations:
            NDJSONStorage.append(explainability_file, evaluation.model_dump(mode='json'))
        print(f"✓ Created {len(evaluations)} explainability evaluations for {model.name}")

    # Create drift evaluations
    for model in models:
        evaluations = create_drift_evaluations(model)
        for evaluation in evaluations:
            NDJSONStorage.append(drift_file, evaluation.model_dump(mode='json'))
        print(f"✓ Created {len(evaluations)} drift evaluations for {model.name}")

    # Create bias evaluations
    for model in models:
        evaluations = create_bias_evaluations(model)
        for evaluation in evaluations:
            NDJSONStorage.append(bias_file, evaluation.model_dump(mode='json'))
        print(f"✓ Created {len(evaluations)} bias evaluations for {model.name}")

    # Create RAG evaluations (only for RAG models)
    for model in models:
        if model.model_type == "rag":
            evaluations = create_rag_evaluations(model)
            for evaluation in evaluations:
                NDJSONStorage.append(rag_file, evaluation.model_dump(mode='json'))
            print(f"✓ Created {len(evaluations)} RAG evaluations for {model.name}")

    # Create risk assessments
    for model in models:
        assessment = create_risk_assessment(model)
        NDJSONStorage.append(risk_file, assessment.model_dump(mode='json'))
        print(f"✓ Created risk assessment for {model.name}")

    # Create governance philosophies
    philosophies = create_governance_philosophies()
    for philosophy in philosophies:
        NDJSONStorage.append(philosophy_file, philosophy.model_dump(mode='json'))
        print(f"✓ Created {philosophy.scope} philosophy for {philosophy.scope_ref}")

    print(f"\n✅ Seed data generation complete!")
    print(f"   - {len(models)} models")
    print(f"   - {len(philosophies)} governance philosophies")
    print(f"   - Full evaluations for all models")


def create_insurance_models():
    """Create 5 realistic insurance AI models"""
    models = []

    # Model 1: Personal Auto Pricing
    models.append(InsuranceAIModel(
        model_id="model_auto_pricing_001",
        name="Personal Auto Pricing Model",
        version="2.1.0",
        model_type=ModelType.REGRESSOR,
        business_domain=BusinessDomain.PC_PERSONAL,
        line_of_business=LineOfBusiness.PERSONAL_AUTO,
        use_case_category=UseCaseCategory.PRICING,
        detailed_use_case="Premium rating for new business and renewal personal auto policies. Predicts pure premium using telematics, credit score, and traditional rating factors.",
        owner_team="Personal_Lines_Analytics",
        product_or_program="DirectAuto_Personal",
        jurisdictions=["WI", "MN", "IL", "IN", "OH"],
        deployment_environment=DeploymentEnvironment.PROD,
        deployment_details={
            "endpoint": "https://pricing-api.insurance.com/v1/auto",
            "region": "us-central1",
            "integrated_systems": ["PolicyAdmin", "RatingEngine", "UnderwritingWorkbench"]
        },
        external_data_sources=["credit_based_insurance_score", "telematics_score", "LexisNexis_ClaimsReport"],
        governance_status=GovernanceStatus.APPROVED_FOR_PROD,
        created_at=datetime.utcnow() - timedelta(days=180),
        updated_at=datetime.utcnow() - timedelta(days=30)
    ))

    # Model 2: Homeowners Underwriting RAG Copilot
    models.append(InsuranceAIModel(
        model_id="model_home_uw_copilot_001",
        name="Homeowners Underwriting RAG Copilot",
        version="1.0.2",
        model_type=ModelType.RAG,
        business_domain=BusinessDomain.PC_PERSONAL,
        line_of_business=LineOfBusiness.HOMEOWNERS,
        use_case_category=UseCaseCategory.OPERATIONAL_COPILOT,
        detailed_use_case="AI assistant for underwriters to query policy guidelines, catastrophe risk data, and underwriting rules. Provides grounded responses with citations.",
        owner_team="Personal_Lines_UW_Operations",
        product_or_program="Homeowners_Preferred",
        jurisdictions=["CA", "TX", "FL", "AZ", "NV"],
        deployment_environment=DeploymentEnvironment.TEST,
        deployment_details={
            "endpoint": "https://copilot-api.insurance.com/v1/home-uw",
            "region": "us-west1",
            "integrated_systems": ["UnderwritingWorkbench", "GuidelinesKB"]
        },
        external_data_sources=["wildfire_risk_score", "flood_zone_data", "property_inspection_reports"],
        governance_status=GovernanceStatus.IN_REVIEW,
        created_at=datetime.utcnow() - timedelta(days=90),
        updated_at=datetime.utcnow() - timedelta(days=5)
    ))

    # Model 3: Workers Comp Claims Fraud Detector
    models.append(InsuranceAIModel(
        model_id="model_wc_fraud_001",
        name="Workers Comp Claims Fraud Detector",
        version="3.2.1",
        model_type=ModelType.CLASSIFIER,
        business_domain=BusinessDomain.PC_COMMERCIAL,
        line_of_business=LineOfBusiness.WORKERS_COMPENSATION,
        use_case_category=UseCaseCategory.FRAUD,
        detailed_use_case="Binary classifier for identifying potentially fraudulent workers compensation claims. Flags claims for SIU investigation based on claim patterns, medical provider history, and claimant behavior.",
        owner_team="Commercial_Lines_SIU",
        product_or_program="WorkersComp_AllStates",
        jurisdictions=["NY", "NJ", "PA", "MA", "CT"],
        deployment_environment=DeploymentEnvironment.PROD,
        deployment_details={
            "endpoint": "https://fraud-api.insurance.com/v1/wc",
            "region": "us-east1",
            "integrated_systems": ["ClaimsManagement", "SIU_CaseManagement"]
        },
        external_data_sources=["third_party_medical_validation", "provider_fraud_history"],
        governance_status=GovernanceStatus.APPROVED_FOR_PROD,
        created_at=datetime.utcnow() - timedelta(days=365),
        updated_at=datetime.utcnow() - timedelta(days=15)
    ))

    # Model 4: Commercial Auto Underwriting Agent
    models.append(InsuranceAIModel(
        model_id="model_comm_auto_agent_001",
        name="Commercial Auto Underwriting Agent",
        version="0.9.0",
        model_type=ModelType.AGENT,
        business_domain=BusinessDomain.PC_COMMERCIAL,
        line_of_business=LineOfBusiness.COMMERCIAL_AUTO,
        use_case_category=UseCaseCategory.UNDERWRITING,
        detailed_use_case="Agentic AI system for commercial auto underwriting triage. Routes submissions to appropriate underwriter queues, requests additional information, and pre-fills application data.",
        owner_team="Commercial_Auto_Underwriting",
        product_or_program="SmallFleet_Auto",
        jurisdictions=["TX", "OH", "MI", "GA", "NC"],
        deployment_environment=DeploymentEnvironment.DEV,
        deployment_details={
            "endpoint": "https://dev-agent-api.insurance.com/v1/comm-auto",
            "region": "us-south1",
            "integrated_systems": ["SubmissionIntake", "UnderwriterWorkbench"]
        },
        external_data_sources=["business_risk_score", "fleet_telematics", "MVR_data"],
        governance_status=GovernanceStatus.DRAFT,
        created_at=datetime.utcnow() - timedelta(days=45),
        updated_at=datetime.utcnow() - timedelta(days=2)
    ))

    # Model 5: Small Commercial Property Pricing (CRITICAL RISK)
    models.append(InsuranceAIModel(
        model_id="model_prop_pricing_001",
        name="Small Commercial Property Pricing",
        version="1.8.3",
        model_type=ModelType.REGRESSOR,
        business_domain=BusinessDomain.PC_COMMERCIAL,
        line_of_business=LineOfBusiness.PROPERTY,
        use_case_category=UseCaseCategory.PRICING,
        detailed_use_case="Premium calculation for small commercial property policies. Uses building characteristics, catastrophe models, and business type to predict expected loss.",
        owner_team="Commercial_Lines_Pricing",
        product_or_program="SmallBusiness_Property",
        jurisdictions=["CA", "WA", "OR", "AZ", "NV", "UT", "ID", "MT"],
        deployment_environment=DeploymentEnvironment.PROD,
        deployment_details={
            "endpoint": "https://pricing-api.insurance.com/v1/property",
            "region": "us-west1",
            "integrated_systems": ["PolicyAdmin", "RatingEngine"]
        },
        external_data_sources=["catastrophe_model_score", "building_inspection_data", "business_credit_score"],
        governance_status=GovernanceStatus.TEMPORARILY_SUSPENDED,
        created_at=datetime.utcnow() - timedelta(days=200),
        updated_at=datetime.utcnow() - timedelta(days=1)
    ))

    return models


def create_lineage_for_model(model: InsuranceAIModel):
    """Create lineage entries for a model"""
    entries = []

    # Initial lineage
    entries.append(LineageEntry(
        timestamp=model.created_at,
        model_id=model.model_id,
        data_sources=["PolicyData_2020-2023", "ClaimsData_2020-2023", "ExternalBureauData"],
        external_data_sources=model.external_data_sources,
        training_pipeline="ml-pipeline-v2",
        feature_store_refs=["feature_store_insurance_v1"],
        artifacts={"model_artifact": f"gs://models/{model.model_id}/v1"},
        deployment=model.deployment_details
    ))

    # Recent update
    if model.version != "1.0.0":
        entries.append(LineageEntry(
            timestamp=model.updated_at,
            model_id=model.model_id,
            data_sources=["PolicyData_2021-2024", "ClaimsData_2021-2024", "ExternalBureauData"],
            external_data_sources=model.external_data_sources,
            training_pipeline="ml-pipeline-v2",
            feature_store_refs=["feature_store_insurance_v2"],
            artifacts={"model_artifact": f"gs://models/{model.model_id}/v2"},
            deployment=model.deployment_details
        ))

    return entries


def get_control_ids():
    """Get all control IDs from catalog"""
    return [
        "NAIC-AI-01", "NAIC-AI-02", "NAIC-AI-03", "NAIC-AI-04", "NAIC-AI-05",
        "NAIC-AI-06", "NAIC-AI-07", "NAIC-AI-08", "NAIC-AI-09", "NAIC-AI-10",
        "RAG-01", "RAG-02", "FAIR-01", "FAIR-02", "XAI-01"
    ]


def create_control_evaluations(model: InsuranceAIModel, control_ids: list):
    """Create control evaluations for a model"""
    evaluations = []

    for control_id in control_ids:
        # RAG controls only apply to RAG models
        if control_id.startswith("RAG") and model.model_type != "rag":
            status = ControlEvaluationStatus.NOT_APPLICABLE
            rationale = "Not a RAG-based model"
        else:
            # Determine status based on model governance status
            if model.governance_status == "approved_for_prod":
                status = ControlEvaluationStatus.PASSED
                rationale = f"Control {control_id} validated and approved"
            elif model.governance_status == "temporarily_suspended":
                if control_id in ["FAIR-01", "FAIR-02"]:
                    status = ControlEvaluationStatus.FAILED
                    rationale = "Bias testing revealed unfair discrimination concerns"
                else:
                    status = ControlEvaluationStatus.PASSED
                    rationale = f"Control {control_id} passed"
            elif model.governance_status == "in_review":
                status = ControlEvaluationStatus.PASSED if random.random() > 0.2 else ControlEvaluationStatus.NEEDS_REVIEW
                rationale = f"Control {control_id} under review" if status == ControlEvaluationStatus.NEEDS_REVIEW else f"Control {control_id} passed"
            else:  # DRAFT
                status = ControlEvaluationStatus.NEEDS_REVIEW if random.random() > 0.5 else ControlEvaluationStatus.NOT_APPLICABLE
                rationale = "Evaluation in progress"

        evaluations.append(ControlEvaluation(
            model_id=model.model_id,
            control_id=control_id,
            status=status,
            rationale=rationale,
            evidence_links=[],
            last_updated=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        ))

    return evaluations


def create_explainability_evaluations(model: InsuranceAIModel):
    """Create explainability evaluations"""
    evaluations = []

    if model.model_type == "rag":
        method = ExplainabilityMethod.PROMPT_TRACE
    elif model.model_type == "agent":
        method = ExplainabilityMethod.AGENT_TRACE
    else:
        method = ExplainabilityMethod.SHAP

    evaluations.append(ExplainabilityEvaluation(
        model_id=model.model_id,
        decision_context=f"{model.use_case_category}_Decisions",
        method=method,
        summary=f"Explainability analysis using {method.value} for {model.name}",
        key_findings=[
            f"Top contributing factors identified for {model.use_case_category}",
            "Feature importance aligns with domain expertise",
            "No unexpected or concerning feature interactions"
        ],
        limitations="Limited to linear feature contributions" if method == ExplainabilityMethod.SHAP else "Trace-based explainability",
        explainability_score=random.uniform(70, 95) if model.governance_status != "draft" else random.uniform(50, 70),
        suitable_for_customer_communication=model.governance_status == "approved_for_prod",
        timestamp=datetime.utcnow() - timedelta(days=random.randint(5, 60))
    ))

    return evaluations


def create_drift_evaluations(model: InsuranceAIModel):
    """Create drift evaluations"""
    evaluations = []

    # Data drift
    breached = model.model_id == "model_wc_fraud_001"  # WC fraud model has drift
    evaluations.append(DriftEvaluation(
        model_id=model.model_id,
        drift_type=DriftType.DATA,
        metric="PSI",
        value=0.35 if breached else random.uniform(0.05, 0.15),
        threshold=0.25,
        status=DriftStatus.BREACHED if breached else DriftStatus.WITHIN_TOLERANCE,
        observation_window="Last_30_Days",
        insurance_impact_summary="Significant shift in claim characteristics observed" if breached else "Stable claim patterns",
        notes="Medical provider mix has changed substantially" if breached else "Normal variation",
        timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 15))
    ))

    # Prediction drift
    evaluations.append(DriftEvaluation(
        model_id=model.model_id,
        drift_type=DriftType.PREDICTION,
        metric="Mean_Prediction_Shift",
        value=random.uniform(0.01, 0.08),
        threshold=0.10,
        status=DriftStatus.WITHIN_TOLERANCE,
        observation_window="Last_60_Days",
        insurance_impact_summary="Prediction distributions stable",
        notes="",
        timestamp=datetime.utcnow() - timedelta(days=random.randint(10, 40))
    ))

    return evaluations


def create_bias_evaluations(model: InsuranceAIModel):
    """Create bias/unfair discrimination evaluations"""
    evaluations = []

    # Critical bias for suspended model
    if model.governance_status == "temporarily_suspended":
        evaluations.append(BiasEvaluation(
            model_id=model.model_id,
            test_scope="Commercial_Property_Pricing",
            protected_or_prohibited_factor="zip_code_proxy_for_race",
            test_type="Disparate_Impact_Analysis",
            metric="Adverse_Impact_Ratio",
            value=0.65,
            threshold=0.80,
            status=BiasTestStatus.UNACCEPTABLE,
            mitigation_plan="Implement ZIP code debiasing and add protected class monitoring",
            customer_harm_risk=CustomerHarmRisk.HIGH,
            regulatory_concern_flag=True,
            timestamp=datetime.utcnow() - timedelta(days=2)
        ))
    else:
        # Normal bias testing
        evaluations.append(BiasEvaluation(
            model_id=model.model_id,
            test_scope=f"{model.line_of_business}_{model.use_case_category}",
            protected_or_prohibited_factor="gender",
            test_type="Demographic_Parity",
            metric="Statistical_Parity_Difference",
            value=random.uniform(0.01, 0.05),
            threshold=0.10,
            status=BiasTestStatus.ACCEPTABLE,
            customer_harm_risk=CustomerHarmRisk.LOW,
            regulatory_concern_flag=False,
            timestamp=datetime.utcnow() - timedelta(days=random.randint(10, 50))
        ))

    return evaluations


def create_rag_evaluations(model: InsuranceAIModel):
    """Create RAG evaluations for RAG models"""
    evaluations = []

    evaluations.append(RAGEvaluation(
        model_id=model.model_id,
        eval_batch_id=f"batch_{datetime.utcnow().strftime('%Y%m%d')}",
        grounding_score=0.85,
        hallucination_rate=0.05,
        context_relevance_score=0.88,
        method=RAGEvaluationMethod.LLM_JUDGE,
        summary="RAG evaluation shows strong grounding with low hallucination rate",
        notes="All responses properly cited source documents",
        coverage_misstatement_flag=False,
        timestamp=datetime.utcnow() - timedelta(days=random.randint(3, 20))
    ))

    return evaluations


def create_risk_assessment(model: InsuranceAIModel):
    """Create risk assessment for a model"""
    # Risk based on governance status
    if model.governance_status == "temporarily_suspended":
        risk_score = random.uniform(85, 95)
        risk_level = RiskLevel.CRITICAL
        drivers = ["Unfair discrimination detected", "Regulatory concern flagged", "Production deployment"]
    elif model.governance_status == "draft":
        risk_score = random.uniform(40, 60)
        risk_level = RiskLevel.MEDIUM
        drivers = ["Incomplete control evaluations", "Limited testing"]
    elif model.model_id == "model_wc_fraud_001":
        risk_score = random.uniform(70, 79)
        risk_level = RiskLevel.HIGH
        drivers = ["Drift threshold breached", "Production deployment", "High-stakes fraud detection"]
    else:
        risk_score = random.uniform(25, 45)
        risk_level = RiskLevel.MEDIUM if risk_score > 35 else RiskLevel.LOW
        drivers = ["Normal operational risks"]

    return RiskAssessment(
        model_id=model.model_id,
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
        primary_risk_drivers=drivers,
        business_impact_summary=f"Risk level {risk_level.value} for {model.line_of_business} {model.use_case_category}. Deployed in {len(model.jurisdictions)} jurisdictions.",
        mitigation_plan="Ongoing monitoring and bias testing" if risk_level in [RiskLevel.LOW, RiskLevel.MEDIUM] else "Immediate remediation required",
        residual_risk_accepted=risk_level in [RiskLevel.LOW, RiskLevel.MEDIUM],
        residual_risk_approver="Chief_Risk_Officer" if risk_level in [RiskLevel.LOW, RiskLevel.MEDIUM] else None,
        timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 10))
    )


def create_governance_philosophies():
    """Create governance philosophies at different scopes"""
    philosophies = []

    # Org-level philosophy
    philosophies.append(GovernancePhilosophy(
        scope=PhilosophyScope.ORG,
        scope_ref="enterprise",
        risk_appetite="Moderate risk appetite for AI in insurance operations. Accept low to medium risks for operational efficiency gains. Require executive approval for high-risk AI deployments.",
        fairness_and_unfair_discrimination_principles="Zero tolerance for unfair discrimination based on protected classes. All models must pass disparate impact testing before production deployment. ZIP code and proxy variables require special review.",
        external_data_and_vendor_controls="All external data sources must be validated for quality, bias, and regulatory compliance. Vendor models require full transparency into training data and methodology.",
        regulatory_alignment_principles="Compliance with NAIC AI Principles is mandatory. All state DOI filing requirements must be met before deployment. Market conduct exam readiness is a key requirement.",
        safety_and_customer_protection_principles="Customer harm prevention is paramount. Adverse action processes must be clear and fair. Appeals mechanisms required for all AI-driven decisions.",
        explainability_and_customer_communication="All customer-facing AI decisions must be explainable in plain language. Technical explainability (SHAP/LIME) required for all pricing and underwriting models.",
        auditability_and_DOI_exam_readiness="Comprehensive model documentation required. Evidence packs must be generated quarterly for production models. Audit trail for all model changes.",
        lifecycle_governance="Formal approval process for all production deployments. Ongoing monitoring required. Annual model validation for all high-risk models.",
        generated_by_llm=False,
        created_at=datetime.utcnow() - timedelta(days=365)
    ))

    # LoB-level philosophy (Personal Auto)
    philosophies.append(GovernancePhilosophy(
        scope=PhilosophyScope.LINE_OF_BUSINESS,
        scope_ref="Personal Auto",
        risk_appetite="Conservative risk appetite for auto pricing models given high regulatory scrutiny. Telematics and credit scores require special bias testing.",
        fairness_and_unfair_discrimination_principles="Credit-based insurance scores must comply with state-specific regulations. Telematics programs must be voluntary and non-discriminatory.",
        external_data_and_vendor_controls="LexisNexis claims data requires validation. Telematics vendors must provide transparent scoring methodology.",
        regulatory_alignment_principles="File and approval required in regulated states. Rate adequacy and non-discrimination are key regulatory concerns.",
        safety_and_customer_protection_principles="Clear disclosure of all rating factors to customers. Premium increases must be justified and explainable.",
        explainability_and_customer_communication="Rate factors must be communicated clearly. Customers must understand how their premium is calculated.",
        auditability_and_DOI_exam_readiness="Rate filings must include full model documentation. Ready for market conduct exams at all times.",
        lifecycle_governance="Annual rate review and model validation required. Emergency procedures for model issues.",
        generated_by_llm=False,
        created_at=datetime.utcnow() - timedelta(days=200)
    ))

    # LoB-level philosophy (Workers Compensation)
    philosophies.append(GovernancePhilosophy(
        scope=PhilosophyScope.LINE_OF_BUSINESS,
        scope_ref="Workers_Compensation",
        risk_appetite="Low risk tolerance for WC fraud models given potential for wrongful claim denial. Human oversight required for all fraud flags.",
        fairness_and_unfair_discrimination_principles="No discrimination based on injury type or medical provider. Statistical models must be validated for bias against specific demographics.",
        external_data_and_vendor_controls="Medical validation services must be licensed and compliant. Provider fraud databases require validation.",
        regulatory_alignment_principles="Comply with state-specific WC regulations. No automated claim denials without human review.",
        safety_and_customer_protection_principles="Injured worker protection is paramount. False positives in fraud detection must be minimized. Clear appeals process.",
        explainability_and_customer_communication="Fraud flags must be explainable to claims adjusters. No 'black box' fraud scores.",
        auditability_and_DOI_exam_readiness="Full audit trail for fraud investigations. Evidence for SIU cases must be documented.",
        lifecycle_governance="Quarterly fraud model validation. Drift monitoring for claim pattern changes.",
        generated_by_llm=False,
        created_at=datetime.utcnow() - timedelta(days=180)
    ))

    return philosophies


if __name__ == "__main__":
    main()
