"""Risk scoring service"""
import os
from typing import Optional
from datetime import datetime

from app.models.risk import RiskAssessment, RiskLevel
from app.storage.json_storage import JSONStorage
from app.storage.ndjson_storage import NDJSONStorage
from app.config import settings


class RiskScoringService:
    """Calculate risk scores for AI models"""

    @staticmethod
    def calculate_risk_score(model_id: str) -> Optional[RiskAssessment]:
        """
        Calculate weighted risk score for a model

        Weighting:
        - Bias/unfair discrimination: 40%
        - Control evaluations: 25%
        - Explainability: 20%
        - Drift: 10%
        - Operational factors: 5%
        """
        # Load model
        models_file = os.path.join(settings.data_dir, "models.json")
        model = JSONStorage.find_by_id(models_file, "model_id", model_id)

        if not model:
            return None

        # Get all evaluations
        control_evals = NDJSONStorage.get_all_for_model(
            os.path.join(settings.data_dir, "control_evaluations.ndjson"),
            model_id
        )
        bias_evals = NDJSONStorage.get_all_for_model(
            os.path.join(settings.data_dir, "bias.ndjson"),
            model_id
        )
        explainability_evals = NDJSONStorage.get_all_for_model(
            os.path.join(settings.data_dir, "explainability.ndjson"),
            model_id
        )
        drift_evals = NDJSONStorage.get_all_for_model(
            os.path.join(settings.data_dir, "drift.ndjson"),
            model_id
        )

        # Calculate component scores (0-100)
        bias_score = RiskScoringService._calculate_bias_score(bias_evals)
        control_score = RiskScoringService._calculate_control_score(control_evals)
        explainability_score = RiskScoringService._calculate_explainability_score(explainability_evals)
        drift_score = RiskScoringService._calculate_drift_score(drift_evals)
        operational_score = RiskScoringService._calculate_operational_score(model)

        # Weighted total
        total_score = (
            bias_score * 0.40 +
            control_score * 0.25 +
            explainability_score * 0.20 +
            drift_score * 0.10 +
            operational_score * 0.05
        )

        # Determine risk level
        if total_score >= 80:
            risk_level = RiskLevel.CRITICAL
        elif total_score >= 60:
            risk_level = RiskLevel.HIGH
        elif total_score >= 30:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # Identify primary risk drivers
        risk_drivers = []
        if bias_score >= 70:
            risk_drivers.append("Unfair discrimination concerns")
        if control_score >= 60:
            risk_drivers.append("Failed mandatory controls")
        if explainability_score >= 50:
            risk_drivers.append("Low explainability for customer-facing decisions")
        if drift_score >= 70:
            risk_drivers.append("Model drift threshold breaches")
        if operational_score >= 50:
            risk_drivers.append("High-risk operational deployment")

        # Generate summary
        business_impact = f"Risk level {risk_level.value} for {model.get('line_of_business')} {model.get('use_case_category')} model. "
        business_impact += f"Deployed in {len(model.get('jurisdictions', []))} jurisdiction(s). "

        if model.get('deployment_environment') == 'prod':
            business_impact += "Production deployment requires immediate attention for high/critical risks."
        else:
            business_impact += f"Currently in {model.get('deployment_environment')} environment."

        return RiskAssessment(
            model_id=model_id,
            risk_score=round(total_score, 2),
            risk_level=risk_level,
            primary_risk_drivers=risk_drivers if risk_drivers else ["No significant risks identified"],
            business_impact_summary=business_impact,
            timestamp=datetime.utcnow()
        )

    @staticmethod
    def _calculate_bias_score(bias_evals: list) -> float:
        """Calculate bias risk score (0-100, higher = more risk)"""
        if not bias_evals:
            return 30  # Default moderate risk if no testing

        latest = bias_evals[0] if bias_evals else {}

        # High risk factors
        if latest.get("status") == "unacceptable":
            return 90
        if latest.get("regulatory_concern_flag"):
            return 80
        if latest.get("customer_harm_risk") == "high":
            return 70
        if latest.get("status") == "needs_review":
            return 50
        if latest.get("customer_harm_risk") == "medium":
            return 30

        return 10  # Acceptable status

    @staticmethod
    def _calculate_control_score(control_evals: list) -> float:
        """Calculate control compliance risk score"""
        if not control_evals:
            return 60  # High risk if no controls evaluated

        total = len(control_evals)
        failed = len([c for c in control_evals if c.get("status") == "failed"])
        needs_review = len([c for c in control_evals if c.get("status") == "needs_review"])

        # Score based on failure rate
        failure_rate = (failed + (needs_review * 0.5)) / total if total > 0 else 1.0

        return min(100, failure_rate * 100)

    @staticmethod
    def _calculate_explainability_score(explainability_evals: list) -> float:
        """Calculate explainability risk score"""
        if not explainability_evals:
            return 40  # Moderate risk if no explainability

        latest = explainability_evals[0] if explainability_evals else {}
        score = latest.get("explainability_score")

        if score is None:
            return 40

        # Invert score (high explainability = low risk)
        return 100 - score

    @staticmethod
    def _calculate_drift_score(drift_evals: list) -> float:
        """Calculate drift risk score"""
        if not drift_evals:
            return 20  # Low risk if no drift detected

        breached = [d for d in drift_evals if d.get("status") == "breached"]

        if breached:
            return min(100, len(breached) * 40)  # Multiple breaches compound risk

        return 5  # Within tolerance

    @staticmethod
    def _calculate_operational_score(model: dict) -> float:
        """Calculate operational risk score"""
        score = 0

        # Production deployment increases operational risk
        if model.get("deployment_environment") == "prod":
            score += 30

        # High-jurisdiction count increases risk
        jurisdictions = model.get("jurisdictions", [])
        if len(jurisdictions) > 10:
            score += 30
        elif len(jurisdictions) > 5:
            score += 15

        # High-stakes use cases
        high_stakes_cases = ["Pricing", "Underwriting", "Claims"]
        if model.get("use_case_category") in high_stakes_cases:
            score += 20

        # External data sources increase risk
        if len(model.get("external_data_sources", [])) > 2:
            score += 20

        return min(100, score)
