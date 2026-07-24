from datetime import datetime
from io import BytesIO

import pandas as pd

REQUIRED_COLUMNS = ["카테고리", "상품", "상품ID", "날짜", "회사", "쇼핑몰", "별점", "리뷰 원문"]


def parse_reviews_excel(content: bytes) -> pd.DataFrame:
    try:
        df = pd.read_excel(BytesIO(content))
    except Exception as exc:
        raise ValueError("엑셀 파일을 읽을 수 없습니다. 파일이 손상되지 않았는지 확인하세요.") from exc

    missing = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing:
        raise ValueError(f"엑셀 파일에 필수 컬럼이 없습니다: {', '.join(sorted(missing))}")
    if df.empty:
        raise ValueError("엑셀 파일에 리뷰 데이터가 없습니다.")

    return df


def build_meta_info(df: pd.DataFrame) -> dict:
    company_name = str(df["회사"].dropna().iloc[0]).strip()
    total_reviews = len(df)
    date_series = pd.to_datetime(df["날짜"], errors="coerce")
    mall_counts = df["쇼핑몰"].value_counts()
    overall_mall_summary = " | ".join(
        f"**{mall}**: {count}건 ({count / total_reviews * 100:.1f}%)"
        for mall, count in mall_counts.items()
    )

    return {
        "company_name": company_name,
        "total_reviews": total_reviews,
        "min_date": date_series.min().strftime("%Y.%m.%d"),
        "max_date": date_series.max().strftime("%Y.%m.%d"),
        "today_str": datetime.now().strftime("%Y년 %m월 %d일"),
        "overall_mall_summary": overall_mall_summary,
    }


def build_category_contexts(df: pd.DataFrame) -> dict[str, str]:
    category_contexts: dict[str, str] = {}
    for category, group in df.groupby("카테고리"):
        context = f"■ 카테고리: {category} (총 {len(group)}건)\n"
        for _, row in group.iterrows():
            context += (
                f"  [{row['날짜']} | 쇼핑몰: {row['쇼핑몰']} | 상품: {row['상품']}(ID:{row['상품ID']}) | 별점: {row['별점']}점] "
                f"리뷰: {row['리뷰 원문']}\n"
            )
        category_contexts[str(category)] = context
    return category_contexts
