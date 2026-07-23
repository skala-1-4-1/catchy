import asyncio
from pathlib import Path
from typing import List, Literal

import pandas as pd
from crewai import Agent, Crew, Process, Task
from pydantic import BaseModel

from .config import get_llm

CSV_PATH = Path(__file__).resolve().parent.parent / "ecommerce_review_data.csv"
BATCH_SIZE = 40


class ReviewLabel(BaseModel):
    리뷰ID: str
    감정: Literal["긍정", "중립", "부정"]
    이슈카테고리: Literal["배송", "품질", "가격", "포장", "CS응대", "사이즈핏", "맛/풍미", "기타"]


class ReviewLabelBatch(BaseModel):
    labels: List[ReviewLabel]


def _build_classification_crew() -> Crew:
    review_classifier = Agent(
        role="리뷰 분류가",
        goal="리뷰 원문 {reviews}을 읽고 각 리뷰의 감정과 이슈카테고리를 정확히 태깅한다.",
        backstory=(
            "당신은 이커머스 상품 리뷰를 읽고 감정(긍정/중립/부정)과 이슈카테고리를 "
            "분류하는 전문가입니다. 리뷰ID는 절대 새로 만들지 않고 주어진 것만 사용하며, "
            "모든 리뷰를 빠짐없이 분류합니다."
        ),
        llm=get_llm(),
        allow_delegation=False,
        verbose=False,
    )
    classification_task = Task(
        description=(
            "아래 리뷰들을 한 건도 빠짐없이 분류하세요. 형식은 '리뷰ID: 리뷰텍스트'입니다.\n\n"
            "{reviews}\n\n"
            "각 리뷰에 대해 감정(긍정/중립/부정)과 이슈카테고리 "
            "(배송/품질/가격/포장/CS응대/사이즈핏/맛·풍미/기타) 중 하나를 정확히 태깅하세요."
        ),
        expected_output="입력된 모든 리뷰ID에 대한 감정·이슈카테고리 라벨 목록",
        agent=review_classifier,
        output_pydantic=ReviewLabelBatch,
    )
    return Crew(
        agents=[review_classifier],
        tasks=[classification_task],
        process=Process.sequential,
        verbose=False,
    )


async def _classify_reviews(df: pd.DataFrame) -> pd.DataFrame:
    crew = _build_classification_crew()
    all_labels = []
    for start in range(0, len(df), BATCH_SIZE):
        batch = df.iloc[start : start + BATCH_SIZE]
        review_lines = "\n".join(f"{r['리뷰ID']}: {r['리뷰원문']}" for _, r in batch.iterrows())
        result = await crew.kickoff_async(inputs={"reviews": review_lines})
        all_labels.extend(result.pydantic.labels)

    labels_df = pd.DataFrame([label.model_dump() for label in all_labels])
    return df.merge(labels_df, on="리뷰ID", how="left")


def _aggregate(labeled_df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    labeled_df["월"] = labeled_df["날짜(시간)"].str[:7]

    monthly_sentiment = (
        labeled_df.groupby("월")["감정"].value_counts(normalize=True).unstack(fill_value=0).round(3)
    )

    issue_counts = labeled_df.groupby(["월", "상품", "이슈카테고리"]).size().reset_index(name="건수")
    issue_counts["전월건수"] = issue_counts.groupby(["상품", "이슈카테고리"])["건수"].shift(1).fillna(0)
    issue_counts["증감"] = issue_counts["건수"] - issue_counts["전월건수"]
    spikes = issue_counts[issue_counts["증감"] >= 4].sort_values("증감", ascending=False)

    sample_negative = (
        labeled_df[labeled_df["감정"] == "부정"]
        .sort_values("날짜(시간)")
        .groupby(["상품", "이슈카테고리"])
        .tail(2)[["리뷰ID", "월", "상품", "이슈카테고리", "리뷰원문"]]
    )

    return monthly_sentiment, spikes, sample_negative


class ReviewInsights:
    """리뷰 분류·집계 결과를 최초 1회만 계산해 캐싱한다 (API 비용 절감)."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._cache: tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame] | None = None

    async def get(self) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        if self._cache is not None:
            return self._cache
        async with self._lock:
            if self._cache is None:
                df = pd.read_csv(CSV_PATH)
                labeled_df = await _classify_reviews(df)
                self._cache = _aggregate(labeled_df)
        return self._cache


review_insights = ReviewInsights()
