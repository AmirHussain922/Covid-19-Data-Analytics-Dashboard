from __future__ import annotations

import pandas as pd
from fastapi import APIRouter, Request

from app.models.schemas import GlobalTrendPoint, GlobalTrendResponse


router = APIRouter(tags=["trends"])


@router.get("/api/global-trend", response_model=GlobalTrendResponse)
def global_trend(request: Request) -> GlobalTrendResponse:
    df: pd.DataFrame = request.app.state.covid_df

    grouped = (
        df.groupby("date", as_index=False)["new_cases"]
        .sum()
        .sort_values("date")
        .reset_index(drop=True)
    )

    data = [
        GlobalTrendPoint(date=row["date"].date(), new_cases=int(row["new_cases"]))
        for row in grouped.to_dict(orient="records")
    ]

    return GlobalTrendResponse(data=data)

