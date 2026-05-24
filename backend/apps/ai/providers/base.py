from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class AIResponse:
    content: str
    tokens_input: int = 0
    tokens_output: int = 0
    model: str = ""
    provider: str = ""
    raw: dict = field(default_factory=dict)


class BaseAIProvider(ABC):
    name: str = ""

    @abstractmethod
    def complete(
        self,
        messages: list[dict],
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> AIResponse: ...

    @abstractmethod
    def is_available(self) -> bool: ...
