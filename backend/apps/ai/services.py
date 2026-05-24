"""
High-level AI feature services. Each function builds a prompt, calls the
provider, logs usage, and returns a structured dict ready for the API response.
"""

import json
import re

from django.conf import settings

from .providers import AIProviderFactory
from .providers.base import AIResponse


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _provider(name: str | None = None):
    return AIProviderFactory.get(name)


def _log(feature: str, resp: AIResponse, user) -> None:
    from .models import AIUsageLog
    try:
        AIUsageLog.objects.create(
            feature=feature,
            provider=resp.provider,
            model=resp.model,
            tokens_input=resp.tokens_input,
            tokens_output=resp.tokens_output,
            created_by=user,
        )
    except Exception:
        pass


def _parse_json(text: str) -> dict | list:
    """Strip markdown code fences then parse JSON."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    return json.loads(cleaned.strip())


def _max_tokens() -> int:
    return getattr(settings, "AI_MAX_TOKENS", 2048)


# ─── Blog Writer ──────────────────────────────────────────────────────────────

_BLOG_SYSTEM = (
    "You are an expert blog writer for BlackMarlin BD, a tech company specialising in "
    "AI & Machine Learning, Financial Systems, Cloud & DevOps, Web & Mobile, and Cybersecurity. "
    "Always respond with a single valid JSON object only — no preamble, no markdown fences."
)


def generate_blog(
    topic: str,
    keywords: list[str],
    tone: str,
    length: str,
    user,
    provider_name: str | None = None,
) -> dict:
    word_map = {"short": 400, "medium": 800, "long": 1500}
    words = word_map.get(length, 800)

    prompt = (
        f"Write a blog post about: {topic}\n"
        f"Keywords to naturally include: {', '.join(keywords) or 'none'}\n"
        f"Tone: {tone}\n"
        f"Target word count: ~{words} words\n\n"
        'Return exactly this JSON structure:\n'
        '{\n'
        '  "title": "compelling title",\n'
        '  "excerpt": "2-3 sentence summary",\n'
        '  "content": "full post in markdown",\n'
        '  "meta_description": "SEO meta under 160 chars",\n'
        '  "tags": ["tag1","tag2","tag3","tag4","tag5"],\n'
        '  "reading_time": 5\n'
        '}'
    )

    p = _provider(provider_name)
    resp = p.complete(
        [{"role": "system", "content": _BLOG_SYSTEM}, {"role": "user", "content": prompt}],
        max_tokens=_max_tokens(),
        temperature=0.8,
    )
    _log("blog", resp, user)

    result = _parse_json(resp.content)
    result["_provider"] = resp.provider
    result["_model"]    = resp.model
    return result


# ─── SEO Assistant ────────────────────────────────────────────────────────────

_SEO_SYSTEM = (
    "You are a senior SEO strategist. Analyse the supplied content and return structured "
    "JSON insights only — no preamble, no markdown fences."
)


def analyze_seo(
    content: str,
    target_keywords: list[str],
    page_url: str,
    user,
    provider_name: str | None = None,
) -> dict:
    prompt = (
        f"URL: {page_url or 'not provided'}\n"
        f"Target keywords: {', '.join(target_keywords) or 'none'}\n\n"
        f"Content (first 3000 chars):\n{content[:3000]}\n\n"
        "Return exactly this JSON structure:\n"
        "{\n"
        '  "score": 72,\n'
        '  "title_suggestion": "optimised page title ≤60 chars",\n'
        '  "meta_description": "optimised meta ≤160 chars",\n'
        '  "h1_suggestion": "primary heading",\n'
        '  "keyword_density": {"keyword": 2.1},\n'
        '  "issues": ["issue 1"],\n'
        '  "suggestions": ["improvement 1","improvement 2","improvement 3"],\n'
        '  "strengths": ["strength 1","strength 2"],\n'
        '  "readability": "Good",\n'
        '  "estimated_rank_potential": "Medium"\n'
        "}"
    )

    p = _provider(provider_name)
    resp = p.complete(
        [{"role": "system", "content": _SEO_SYSTEM}, {"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.3,
    )
    _log("seo", resp, user)

    result = _parse_json(resp.content)
    result["_provider"] = resp.provider
    result["_model"]    = resp.model
    return result


# ─── FAQ Generator ────────────────────────────────────────────────────────────

_FAQ_SYSTEM = (
    "You are an expert at writing clear, helpful FAQs. "
    "Always respond with valid JSON only — no preamble, no markdown fences."
)


def generate_faq(
    topic: str,
    count: int,
    audience: str,
    user,
    provider_name: str | None = None,
) -> dict:
    prompt = (
        f"Generate {count} FAQ pairs about: {topic}\n"
        f"Target audience: {audience}\n\n"
        "Return exactly this JSON:\n"
        '{"faqs": [{"question": "Q?", "answer": "Answer."}]}'
    )

    p = _provider(provider_name)
    resp = p.complete(
        [{"role": "system", "content": _FAQ_SYSTEM}, {"role": "user", "content": prompt}],
        max_tokens=min(_max_tokens(), 2048),
        temperature=0.6,
    )
    _log("faq", resp, user)

    result = _parse_json(resp.content)
    result["_provider"] = resp.provider
    result["_model"]    = resp.model
    return result


# ─── Lead Analyzer ────────────────────────────────────────────────────────────

_LEAD_SYSTEM = (
    "You are a senior sales analyst at BlackMarlin BD, a B2B tech consultancy. "
    "Analyse the incoming lead data and return structured JSON sales intelligence only — "
    "no preamble, no markdown fences."
)


def analyze_lead(
    contact_data: dict,
    user,
    provider_name: str | None = None,
) -> dict:
    prompt = (
        f"Lead data:\n{json.dumps(contact_data, indent=2)}\n\n"
        "Score this lead and return exactly this JSON:\n"
        "{\n"
        '  "score": 78,\n'
        '  "intent": "high",\n'
        '  "priority": "hot",\n'
        '  "tags": ["enterprise","ai-ml","decision-maker"],\n'
        '  "summary": "2-3 sentence analysis.",\n'
        '  "recommended_action": "Schedule a demo call within 24 hours.",\n'
        '  "next_steps": ["Step 1","Step 2","Step 3"],\n'
        '  "estimated_deal_size": "medium",\n'
        '  "concerns": ["potential concern"]\n'
        "}\n"
        "score=0-100, intent=high/medium/low, priority=hot/warm/cold, deal_size=small/medium/large/enterprise"
    )

    p = _provider(provider_name)
    resp = p.complete(
        [{"role": "system", "content": _LEAD_SYSTEM}, {"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.4,
    )
    _log("lead", resp, user)

    result = _parse_json(resp.content)
    result["_provider"] = resp.provider
    result["_model"]    = resp.model
    return result


# ─── Chatbot ──────────────────────────────────────────────────────────────────

_CONTEXT_PROMPTS: dict[str, str] = {
    "general": (
        "You are a helpful assistant for BlackMarlin BD, a tech company specialising in "
        "AI & Machine Learning, Financial Systems, Cloud & DevOps, Web & Mobile, and Cybersecurity. "
        "Answer questions about services, expertise, and capabilities. Be friendly and concise."
    ),
    "sales": (
        "You are a sales assistant for BlackMarlin BD. Help qualify leads, explain our service "
        "offerings and value propositions, and guide prospects toward scheduling a consultation. "
        "Be persuasive but honest."
    ),
    "support": (
        "You are a technical support assistant for BlackMarlin BD clients. Help troubleshoot "
        "issues, explain technical concepts clearly, and escalate complex problems appropriately. "
        "Be precise and patient."
    ),
    "technical": (
        "You are a senior technical architect at BlackMarlin BD. Discuss architecture decisions, "
        "technology choices, implementation strategies, and engineering best practices in depth. "
        "Be accurate and detailed."
    ),
}


def chat(session, user_message: str, user, provider_name: str | None = None) -> dict:
    from django.utils import timezone

    from .models import AIChatMessage

    system_prompt = _CONTEXT_PROMPTS.get(session.context, _CONTEXT_PROMPTS["general"])

    # Build history — keep last 20 turns to stay within context window
    history = list(session.messages.order_by("-created_at")[:20])
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    for msg in reversed(history):
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_message})

    p = _provider(provider_name)
    resp = p.complete(messages, max_tokens=1024, temperature=0.7)
    _log("chat", resp, user)

    AIChatMessage.objects.create(session=session, role="user",      content=user_message)
    AIChatMessage.objects.create(session=session, role="assistant", content=resp.content, tokens=resp.tokens_output)

    if not session.title:
        session.title = user_message[:80]
        session.save(update_fields=["title", "updated_at"])
    else:
        session.updated_at = timezone.now()
        session.save(update_fields=["updated_at"])

    return {
        "session_id": session.pk,
        "message":    resp.content,
        "provider":   resp.provider,
        "model":      resp.model,
    }
