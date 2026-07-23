from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .crew import generate_report
from .data import review_insights
from .schemas import PromptRequest, PromptResponse

app = FastAPI(title="Ecommerce Review Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://skala-catchy.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/report", response_model=PromptResponse)
async def create_report(payload: PromptRequest) -> PromptResponse:
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="prompt는 비어 있을 수 없습니다.")

    monthly_sentiment, spikes, sample_negative = await review_insights.get()
    response_text = await generate_report(prompt, monthly_sentiment, spikes, sample_negative)
    return PromptResponse(response=response_text)
