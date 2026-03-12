from __future__ import annotations

from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Query, Request

from app.models.schemas import HeatmapResponse


router = APIRouter(tags=["heatmap"])


def _default_heatmap_countries(df: pd.DataFrame, limit: int) -> list[str]:
    latest_date = df["date"].max()
    latest = df[df["date"] == latest_date]
    top = (
        latest.groupby("location", as_index=False)["total_cases"]
        .max()
        .sort_values("total_cases", ascending=False)
        .head(limit)
    )
    return [str(c) for c in top["location"].tolist()]


@router.get("/api/heatmap", response_model=HeatmapResponse)
def heatmap(
    request: Request,
    countries: Annotated[str | None, Query(description="Optional comma-separated list of countries")] = None,
    limit: Annotated[int, Query(ge=2, le=50)] = 20,
) -> HeatmapResponse:
    df: pd.DataFrame = request.app.state.covid_df

    if countries:
        selected = [c.strip() for c in countries.split(",") if c.strip()]
    else:
        selected = _default_heatmap_countries(df, limit=limit)

    subset = df[df["location"].isin(selected)][["date", "location", "new_cases"]]
    pivot = (
        subset.pivot_table(index="date", columns="location", values="new_cases", aggfunc="sum")
        .sort_index()
        .fillna(0)
    )
    corr = pivot.corr().fillna(0).round(4)

    ordered_countries = [str(c) for c in corr.columns.tolist()]
    matrix = corr.to_numpy().tolist()

    return HeatmapResponse(
        countries=ordered_countries,
        matrix=matrix,
        meta={"countries_requested": selected, "rows": int(pivot.shape[0])},
    )

