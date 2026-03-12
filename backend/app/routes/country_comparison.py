from __future__ import annotations

from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Query, Request

from app.models.schemas import (
    CountryComparisonResponse,
    CountryComparisonSeries,
    CountryTrendPoint,
)


router = APIRouter(tags=["countries"])


def _parse_countries_param(value: str) -> list[str]:
    countries = [c.strip() for c in value.split(",")]
    countries = [c for c in countries if c]
    seen: set[str] = set()
    deduped: list[str] = []
    for c in countries:
        if c.lower() in seen:
            continue
        seen.add(c.lower())
        deduped.append(c)
    return deduped


@router.get("/api/country-comparison", response_model=CountryComparisonResponse)
def country_comparison(
    request: Request,
    countries: Annotated[str, Query(description="Comma-separated list of country names")],
) -> CountryComparisonResponse:
    df: pd.DataFrame = request.app.state.covid_df

    country_list = _parse_countries_param(countries)
    filtered = df[df["location"].isin(country_list)]

    series: list[CountryComparisonSeries] = []
    for country in country_list:
        country_df = filtered[filtered["location"] == country]
        grouped = (
            country_df.groupby("date", as_index=False)["total_cases"]
            .max()
            .sort_values("date")
            .reset_index(drop=True)
        )
        points = [
            CountryTrendPoint(date=row["date"].date(), cases=int(row["total_cases"]))
            for row in grouped.to_dict(orient="records")
        ]
        series.append(CountryComparisonSeries(country=country, data=points))

    return CountryComparisonResponse(countries=country_list, series=series)

