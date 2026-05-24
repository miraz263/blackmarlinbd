from django.conf import settings

from .base import BaseAIProvider


class AIProviderFactory:
    _providers: dict[str, type[BaseAIProvider]] = {}

    @classmethod
    def register(cls, provider_class: type[BaseAIProvider]) -> None:
        cls._providers[provider_class.name] = provider_class

    @classmethod
    def get(cls, name: str | None = None) -> BaseAIProvider:
        cls._ensure_registered()
        provider_name = name or getattr(settings, "AI_DEFAULT_PROVIDER", "openai")
        if provider_name not in cls._providers:
            raise ValueError(
                f"Unknown AI provider '{provider_name}'. "
                f"Available: {list(cls._providers)}"
            )
        return cls._providers[provider_name]()

    @classmethod
    def available(cls) -> list[str]:
        cls._ensure_registered()
        return [n for n, klass in cls._providers.items() if klass().is_available()]

    @classmethod
    def _ensure_registered(cls) -> None:
        if not cls._providers:
            from .openai_provider import OpenAIProvider
            from .gemini_provider import GeminiProvider
            cls.register(OpenAIProvider)
            cls.register(GeminiProvider)
