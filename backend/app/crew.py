import pandas as pd
from crewai import Agent, Crew, Process, Task

from .config import get_llm


def _build_insight_crew() -> Crew:
    llm = get_llm()

    trend_analyst = Agent(
        role="리뷰 트렌드 분석가",
        goal=(
            "사전에 계산된 월별 감정 분포 {monthly_sentiment}와 "
            "이슈 급증 데이터 {spikes}를 바탕으로 어떤 상품에서 어떤 문제가 커지고 있는지 해석한다."
        ),
        backstory=(
            "당신은 이커머스 리뷰 데이터를 해석하는 트렌드 분석가입니다. "
            "숫자는 이미 코드로 계산되어 주어지며, 당신은 그 숫자가 의미하는 바를 "
            "설명할 뿐 계산되지 않은 수치를 새로 만들어내지 않습니다."
        ),
        llm=llm,
        allow_delegation=False,
        verbose=False,
    )

    review_reporter = Agent(
        role="리뷰 인사이트 리포터",
        goal=(
            "{request}를 바탕으로 트렌드 분석 결과와 대표 부정 리뷰 {sample_negative}를 종합해 "
            "제품/마케팅팀이 바로 실행할 수 있는 리포트를 작성한다."
        ),
        backstory=(
            "당신은 리뷰 분석 결과를 제품/마케팅팀이 이해하기 쉬운 실행 리포트로 정리하는 "
            "전문가입니다. 대표 리뷰를 인용하며 우선순위와 개선 제안을 제시합니다."
        ),
        llm=llm,
        allow_delegation=False,
        verbose=False,
    )

    trend_task = Task(
        description=(
            "다음 데이터를 바탕으로 상품별·이슈별 추세를 분석하세요.\n"
            "월별 감정분포: {monthly_sentiment}\n"
            "이슈 급증 목록: {spikes}\n"
            "어떤 상품에서 어떤 이슈가 급증했는지, 계절적 요인인지 이상 신호(장애/불량 등)인지 "
            "구분해서 설명하세요. 주어진 수치 외의 값을 지어내지 마세요."
        ),
        expected_output="상품별·이슈별 추세 요약과 급증 원인 추정을 포함한 한국어 분석",
        agent=trend_analyst,
    )

    report_task = Task(
        description=(
            "사용자 요청: {request}\n\n"
            "앞선 트렌드 분석과 대표 부정 리뷰 {sample_negative}를 참고하여 "
            "제품/마케팅팀이 바로 실행할 수 있는 리포트를 작성하세요. "
            "핵심 이슈 Top3, 대표 리뷰 인용, 개선 제안을 포함하세요."
        ),
        expected_output="핵심 이슈 Top3, 리뷰 인용, 개선 제안을 포함한 한국어 Markdown 리포트",
        agent=review_reporter,
        context=[trend_task],
    )

    return Crew(
        agents=[trend_analyst, review_reporter],
        tasks=[trend_task, report_task],
        process=Process.sequential,
        verbose=False,
    )


async def generate_report(
    prompt: str,
    monthly_sentiment: pd.DataFrame,
    spikes: pd.DataFrame,
    sample_negative: pd.DataFrame,
) -> str:
    crew = _build_insight_crew()
    result = await crew.kickoff_async(
        inputs={
            "request": prompt,
            "monthly_sentiment": monthly_sentiment.reset_index().to_dict(orient="records"),
            "spikes": spikes.to_dict(orient="records"),
            "sample_negative": sample_negative.to_dict(orient="records"),
        }
    )
    return result.raw
