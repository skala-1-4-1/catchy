from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .crew import generate_report
from .data import parse_reviews_excel
from .schemas import PromptResponse

app = FastAPI(title="Ecommerce Review Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://skala-catchy.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/report", response_model=PromptResponse)
async def create_report(file: UploadFile = File(...)) -> PromptResponse:
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="엑셀(.xlsx) 파일만 업로드할 수 있습니다.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="빈 파일은 업로드할 수 없습니다.")

    try:
        df = parse_reviews_excel(content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    response_text = await generate_report(df)
    return PromptResponse(response=response_text)
