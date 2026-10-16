from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # LLM / Search
    groq_api_key: str
    groq_model: str = "openai/gpt-oss-120b"
    tavily_api_key: str

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # App
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"
    log_level: str = "INFO"

    # Verification tuning
    max_text_length: int = 50_000
    chunk_size_chars: int = 3000
    max_claims_per_chunk: int = 8
    max_evidence_per_claim: int = 5

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
