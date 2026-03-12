from __future__ import annotations

from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field


class GlobalStatsResponse(BaseModel):
    date: date
    total_cases: int
    total_deaths: int
    total_recovered: int | None = None
    daily_new_cases: int
    death_rate: float = Field(ge=0)


class GlobalTrendPoint(BaseModel):
    date: date
    new_cases: int


class GlobalTrendResponse(BaseModel):
    data: list[GlobalTrendPoint]


class CountryTrendPoint(BaseModel):
    date: date
    cases: int


class CountryComparisonSeries(BaseModel):
    country: str
    data: list[CountryTrendPoint]


class CountryComparisonResponse(BaseModel):
    countries: list[str]
    series: list[CountryComparisonSeries]


class TopCountryItem(BaseModel):
    country: str
    total_cases: int


class TopCountriesResponse(BaseModel):
    date: date
    top_countries: list[TopCountryItem]


class HeatmapResponse(BaseModel):
    countries: list[str]
    matrix: list[list[float]]
    metric: Literal["new_cases"] = "new_cases"
    meta: dict[str, Any] = Field(default_factory=dict)

