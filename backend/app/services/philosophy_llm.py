"""Philosophy LLM service using GPT-3.5-turbo"""
from typing import Optional
from openai import OpenAI

from app.models.philosophy import GovernancePhilosophy
from app.config import settings


class PhilosophyLLMService:
    """Service for LLM-assisted governance philosophy generation"""

    @staticmethod
    def fill_philosophy_gaps(philosophy: GovernancePhilosophy) -> GovernancePhilosophy:
        """Fill empty sections in governance philosophy using LLM"""
        if not settings.openai_api_key or settings.openai_api_key == "sk-your-openai-api-key-here":
            # No API key configured, return as-is
            return philosophy

        client = OpenAI(api_key=settings.openai_api_key)

        # Check which sections are empty
        sections_to_fill = []
        section_map = {
            "risk_appetite": "Risk Appetite",
            "fairness_and_unfair_discrimination_principles": "Fairness and Unfair Discrimination Principles",
            "external_data_and_vendor_controls": "External Data and Vendor Controls",
            "regulatory_alignment_principles": "Regulatory Alignment Principles",
            "safety_and_customer_protection_principles": "Safety and Customer Protection Principles",
            "explainability_and_customer_communication": "Explainability and Customer Communication",
            "auditability_and_DOI_exam_readiness": "Auditability and DOI Exam Readiness",
            "lifecycle_governance": "Lifecycle Governance"
        }

        for field, title in section_map.items():
            value = getattr(philosophy, field)
            if not value or value.strip() == "":
                sections_to_fill.append((field, title))

        if not sections_to_fill:
            # All sections already filled
            return philosophy

        # Generate content for each empty section
        for field, title in sections_to_fill:
            prompt = PhilosophyLLMService._build_prompt(philosophy, title)

            try:
                response = client.chat.completions.create(
                    model=settings.openai_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an insurance AI governance expert with deep knowledge of NAIC AI Principles, state Department of Insurance regulations, and insurance industry best practices."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=500
                )

                generated_content = response.choices[0].message.content
                setattr(philosophy, field, generated_content)
                philosophy.generated_by_llm = True

            except Exception as e:
                # If LLM call fails, leave section empty
                print(f"Error generating {title}: {str(e)}")
                continue

        return philosophy

    @staticmethod
    def _build_prompt(philosophy: GovernancePhilosophy, section_title: str) -> str:
        """Build prompt for LLM"""
        prompt = f"""Generate detailed guidance for the "{section_title}" section of an AI governance philosophy document for insurance.

Context:
- Scope: {philosophy.scope} ({philosophy.scope_ref})
- Industry: Property & Casualty / Commercial Insurance

Requirements:
- Focus on practical, actionable guidance specific to insurance operations
- Reference NAIC AI Principles and state DOI regulatory requirements
- Address unfair discrimination concerns (a critical issue in insurance)
- Consider market conduct examination requirements
- Be specific to insurance use cases (pricing, underwriting, claims, fraud detection)

"""

        # Add section-specific guidance
        if section_title == "Risk Appetite":
            prompt += """For Risk Appetite, address:
- Acceptable risk levels for AI in insurance decisions
- Risk tolerance for different lines of business and use cases
- Escalation thresholds for high-risk AI models
"""
        elif section_title == "Fairness and Unfair Discrimination Principles":
            prompt += """For Fairness and Unfair Discrimination Principles, address:
- Prohibited factors (race, gender, religion, etc.)
- Proxy discrimination (ZIP code, occupation, education as proxies)
- Disparate impact testing requirements
- State-specific regulations on protected classes
- Credit-based insurance scores and telematics data
"""
        elif section_title == "External Data and Vendor Controls":
            prompt += """For External Data and Vendor Controls, address:
- Vendor due diligence requirements
- External data validation and quality controls
- Third-party model risk management
- Data licensing and usage rights
"""
        elif section_title == "Regulatory Alignment Principles":
            prompt += """For Regulatory Alignment Principles, address:
- NAIC AI Principles compliance
- State DOI filing requirements
- Market conduct examination preparedness
- Adverse action notice requirements
"""
        elif section_title == "Safety and Customer Protection Principles":
            prompt += """For Safety and Customer Protection Principles, address:
- Customer harm prevention
- Adverse action procedures
- Appeals and recourse mechanisms
- Consumer data privacy
"""
        elif section_title == "Explainability and Customer Communication":
            prompt += """For Explainability and Customer Communication, address:
- Explanation requirements for AI-driven decisions
- Customer-facing communication standards
- Plain language explanation guidelines
- Regulatory transparency requirements
"""
        elif section_title == "Auditability and DOI Exam Readiness":
            prompt += """For Auditability and DOI Exam Readiness, address:
- Model documentation requirements
- Record retention policies
- Evidence pack preparation
- Internal audit procedures
"""
        elif section_title == "Lifecycle Governance":
            prompt += """For Lifecycle Governance, address:
- Model development governance
- Validation and approval processes
- Ongoing monitoring requirements
- Model retirement procedures
"""

        prompt += "\nProvide 3-5 detailed paragraphs with specific, actionable guidance."

        return prompt
