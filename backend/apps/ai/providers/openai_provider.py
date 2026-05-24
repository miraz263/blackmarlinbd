from django.conf import settings

from .base import AIResponse, BaseAIProvider


class OpenAIProvider(BaseAIProvider):
    name = "openai"

    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                import openai
            except ImportError:
                raise RuntimeError(
                    "openai package not installed. Run: pip install openai"
                )
            api_key = getattr(settings, "OPENAI_API_KEY", "")
            if not api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY is not set in environment variables."
                )
            self._client = openai.OpenAI(api_key=api_key)
        return self._client

    def is_available(self) -> bool:
        try:
            import openai  # noqa: F401
            return bool(getattr(settings, "OPENAI_API_KEY", ""))
        except ImportError:
            return False

    def complete(
        self,
        messages: list[dict],
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> AIResponse:
        client = self._get_client()
        model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        choice = response.choices[0]
        usage = response.usage

        return AIResponse(
            content=choice.message.content or "",
            tokens_input=usage.prompt_tokens if usage else 0,
            tokens_output=usage.completion_tokens if usage else 0,
            model=model,
            provider=self.name,
            raw=response.model_dump() if hasattr(response, "model_dump") else {},
        )
