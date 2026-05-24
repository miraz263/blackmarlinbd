from django.conf import settings

from .base import AIResponse, BaseAIProvider


class GeminiProvider(BaseAIProvider):
    name = "gemini"

    def is_available(self) -> bool:
        try:
            import google.generativeai  # noqa: F401
            return bool(getattr(settings, "GEMINI_API_KEY", ""))
        except ImportError:
            return False

    def complete(
        self,
        messages: list[dict],
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> AIResponse:
        try:
            import google.generativeai as genai
        except ImportError:
            raise RuntimeError(
                "google-generativeai not installed. Run: pip install google-generativeai"
            )

        api_key = getattr(settings, "GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")

        genai.configure(api_key=api_key)
        model_name = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
        gen_model = genai.GenerativeModel(model_name)

        # Convert OpenAI-style messages → Gemini history format
        # Gemini uses 'user'/'model' roles; system prompt becomes a priming exchange
        history: list[dict] = []
        for msg in messages[:-1]:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                history.append({"role": "user", "parts": [f"[Instructions] {content}"]})
                history.append({"role": "model", "parts": ["Understood."]})
            elif role == "user":
                history.append({"role": "user", "parts": [content]})
            elif role == "assistant":
                history.append({"role": "model", "parts": [content]})

        last_message = messages[-1]["content"]
        gen_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        )

        if history:
            chat = gen_model.start_chat(history=history)
            response = chat.send_message(last_message, generation_config=gen_config)
        else:
            response = gen_model.generate_content(last_message, generation_config=gen_config)

        return AIResponse(
            content=response.text,
            model=model_name,
            provider=self.name,
        )
