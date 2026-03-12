from __future__ import annotations

from typing import Annotated, Literal

import numpy as np
import pandas as pd
from fastapi import APIRouter, Query, Request

from app.models.schemas import TopCountriesResponse, TopCountryItem


router = APIRouter(tags=["countries"])


@router.get("/api/top-countries", response_model=TopCountriesResponse)
def top_countries(request: Request) -> TopCountriesResponse:
    df: pd.DataFrame = request.app.state.covid_df

    latest_date = df["date"].max()
    latest = df[df["date"] == latest_date]

    grouped = (
        latest.groupby("location", as_index=False)["total_cases"]
        .max()
        .sort_values("total_cases", ascending=False)
        .head(10)
        .reset_index(drop=True)
    )

    top = [
        TopCountryItem(country=row["location"], total_cases=int(row["total_cases"]))
        for row in grouped.to_dict(orient="records")
    ]

    return TopCountriesResponse(date=latest_date.date(), top_countries=top)


@router.get("/api/countries-latest")
def countries_latest(
    request: Request,
    limit: Annotated[int, Query(ge=1, le=250)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    sort: Annotated[
        Literal["total_cases", "new_cases", "total_deaths", "death_rate", "cases_per_100k"],
        Query(),
    ] = "total_cases",
    q: Annotated[str | None, Query(description="Search by country name")] = None,
):
    covid_df: pd.DataFrame = request.app.state.covid_df
    datasets: dict[str, pd.DataFrame] = getattr(request.app.state, "datasets", {})

    as_of = covid_df["date"].max().date()

    worldometer = datasets.get("worldometer")
    pop_map: dict[str, float] = {}
    if worldometer is not None and "location" in worldometer.columns and "population" in worldometer.columns:
        temp = worldometer[["location", "population"]].copy()
        temp["location"] = temp["location"].astype(str)
        temp["population"] = pd.to_numeric(temp["population"], errors="coerce").fillna(0)
        for row in temp.to_dict(orient="records"):
            name = str(row["location"]).strip()
            pop = float(row["population"])
            if not name:
                continue
            pop_map[name] = pop
            pop_map["".join(ch for ch in name.lower() if ch.isalnum())] = pop

    base = datasets.get("country_wise_latest")
    if base is None:
        latest = covid_df[covid_df["date"] == covid_df["date"].max()]
        grouped = (
            latest.groupby("location", as_index=False)[["total_cases", "new_cases", "total_deaths", "population"]]
            .max()
            .reset_index(drop=True)
        )
        grouped["total_recovered"] = 0
        grouped["active"] = 0
        base = grouped
    else:
        base = base.copy()
        if "population" not in base.columns:
            base["population"] = base["location"].astype(str).map(
                lambda n: pop_map.get(n, pop_map.get("".join(ch for ch in str(n).lower() if ch.isalnum()), 0.0))
            )
        if "new_cases" not in base.columns:
            base["new_cases"] = 0

    df = base.copy()
    df["location"] = df["location"].astype(str)
    if q:
        query = q.strip().lower()
        df = df[df["location"].str.lower().str.contains(query)]

    df["total_cases"] = pd.to_numeric(df.get("total_cases"), errors="coerce").fillna(0)
    df["total_deaths"] = pd.to_numeric(df.get("total_deaths"), errors="coerce").fillna(0)
    df["new_cases"] = pd.to_numeric(df.get("new_cases"), errors="coerce").fillna(0)
    df["population"] = pd.to_numeric(df.get("population"), errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(0)

    df["death_rate"] = np.where(df["total_cases"] > 0, (df["total_deaths"] / df["total_cases"]) * 100, 0.0)
    df["cases_per_100k"] = np.where(df["population"] > 0, (df["total_cases"] / df["population"]) * 100000, 0.0)

    df = df.sort_values(sort, ascending=False).reset_index(drop=True)

    total = int(df.shape[0])
    page = df.iloc[offset : offset + limit]

    items = []
    for row in page.to_dict(orient="records"):
        items.append(
            {
                "country": row.get("location"),
                "total_cases": int(row.get("total_cases", 0)),
                "new_cases": int(row.get("new_cases", 0)),
                "total_deaths": int(row.get("total_deaths", 0)),
                "total_recovered": int(row.get("total_recovered", 0)) if "total_recovered" in row else 0,
                "active": int(row.get("active", 0)) if "active" in row else 0,
                "death_rate": float(row.get("death_rate", 0.0)),
                "cases_per_100k": float(row.get("cases_per_100k", 0.0)),
            }
        )

    return {"as_of": str(as_of), "total": total, "limit": limit, "offset": offset, "items": items}


@router.get("/api/datasets")
def datasets(request: Request):
    datasets_map: dict[str, pd.DataFrame] = getattr(request.app.state, "datasets", {})
    result = {}
    for name, df in datasets_map.items():
        result[name] = {
            "rows": int(df.shape[0]),
            "cols": int(df.shape[1]),
            "columns": [str(c) for c in df.columns.tolist()],
        }
    return result
