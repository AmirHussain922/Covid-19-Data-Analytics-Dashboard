from __future__ import annotations

import pandas as pd
from fastapi import APIRouter, Request

from app.models.schemas import GlobalStatsResponse


router = APIRouter(tags=["global"])


@router.get("/api/global-stats", response_model=GlobalStatsResponse)
def global_stats(request: Request) -> GlobalStatsResponse:
    df: pd.DataFrame = request.app.state.covid_df

    latest_date = df["date"].max()
    latest = df[df["date"] == latest_date]

    total_cases = int(latest["total_cases"].sum())
    total_deaths = int(latest["total_deaths"].sum())
    daily_new_cases = int(latest["new_cases"].sum())

    total_recovered = None
    if "total_recovered" in df.columns:
        total_recovered = int(latest["total_recovered"].fillna(0).sum())

    death_rate = float(total_deaths / total_cases) if total_cases > 0 else 0.0

    return GlobalStatsResponse(
        date=latest_date.date(),
        total_cases=total_cases,
        total_deaths=total_deaths,
        total_recovered=total_recovered,
        daily_new_cases=daily_new_cases,
        death_rate=death_rate,
    )

