import os
from functools import lru_cache

from crewai import LLM
from dotenv import load_dotenv

load_dotenv(override=True)


@lru_cache
def get_llm() -> LLM:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY를 찾을 수 없습니다. backend/.env 파일을 확인하세요."
        )
    model_name = os.getenv("OPENAI_MODEL_NAME", "openai/gpt-4o-mini")
    return LLM(model=model_name, api_key=api_key, temperature=0.2)
