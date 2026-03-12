from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


REQUIRED_COLUMNS = {
    "location",
    "date",
    "total_cases",
    "new_cases",
    "total_deaths",
    "population",
}


def get_data_dir() -> Path:
    project_root = Path(__file__).resolve().parents[3]
    return project_root / "Covid19 data"


def _normalize_location(value: str) -> str:
    return "".join(ch for ch in value.strip().lower() if ch.isalnum())


def _load_population_map(data_dir: Path) -> dict[str, float]:
    worldometer_path = data_dir / "worldometer_data.csv"
    if not worldometer_path.exists():
        return {}

    pop_df = pd.read_csv(worldometer_path, usecols=["Country/Region", "Population"])
    pop_df = pop_df.dropna(subset=["Country/Region"]).copy()
    pop_df["Population"] = pd.to_numeric(pop_df["Population"], errors="coerce").fillna(0)

    pop_map: dict[str, float] = {}
    for row in pop_df.to_dict(orient="records"):
        name = str(row["Country/Region"]).strip()
        pop = float(row["Population"])
        if not name:
            continue
        pop_map[name] = pop
        pop_map[_normalize_location(name)] = pop

    return pop_map


def _apply_population(df: pd.DataFrame, pop_map: dict[str, float]) -> pd.DataFrame:
    if not pop_map:
        df["population"] = 0
        return df

    def get_pop(name: str) -> float:
        if name in pop_map:
            return float(pop_map[name])
        key = _normalize_location(name)
        return float(pop_map.get(key, 0))

    df["population"] = df["location"].astype(str).map(get_pop).fillna(0)
    return df


def _standardize_full_grouped(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(
        columns={
            "Country/Region": "location",
            "Date": "date",
            "Confirmed": "total_cases",
            "New cases": "new_cases",
            "Deaths": "total_deaths",
            "Recovered": "total_recovered",
        }
    )
    return df


def _standardize_clean_complete(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(
        columns={
            "Country/Region": "location",
            "Date": "date",
            "Confirmed": "total_cases",
            "Deaths": "total_deaths",
            "Recovered": "total_recovered",
        }
    )
    df["new_cases"] = (
        df.sort_values(["location", "date"])
        .groupby("location")["total_cases"]
        .diff()
        .fillna(df["total_cases"])
    )
    return df


def _validate_and_clean(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).strip() for c in df.columns]

    missing = REQUIRED_COLUMNS.difference(df.columns)
    if missing:
        raise ValueError("Dataset is missing required columns: " + ", ".join(sorted(missing)))

    df = df.dropna(subset=["location", "date"]).copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce", utc=False)
    df = df.dropna(subset=["date"]).copy()

    numeric_cols = ["total_cases", "new_cases", "total_deaths", "population"]
    if "total_recovered" in df.columns:
        numeric_cols.append("total_recovered")

    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["total_cases"] = df["total_cases"].fillna(0)
    df["new_cases"] = df["new_cases"].fillna(0)
    df["total_deaths"] = df["total_deaths"].fillna(0)
    df["population"] = df["population"].replace([np.inf, -np.inf], np.nan).fillna(0)
    if "total_recovered" in df.columns:
        df["total_recovered"] = df["total_recovered"].fillna(0)

    df = df.sort_values(["location", "date"]).reset_index(drop=True)
    return df


def load_covid_dataset() -> pd.DataFrame:
    data_dir = get_data_dir()
    if not data_dir.exists():
        raise FileNotFoundError(f"Data folder not found at: {data_dir}")

    pop_map = _load_population_map(data_dir)

    covid_data_path = data_dir / "covid_data.csv"
    if covid_data_path.exists():
        df = pd.read_csv(covid_data_path)
        df = _validate_and_clean(df)
        return df

    full_grouped_path = data_dir / "full_grouped.csv"
    if full_grouped_path.exists():
        df = pd.read_csv(full_grouped_path)
        df = _standardize_full_grouped(df)
        df = _apply_population(df, pop_map)
        df = _validate_and_clean(df)
        return df

    clean_complete_path = data_dir / "covid_19_clean_complete.csv"
    if clean_complete_path.exists():
        df = pd.read_csv(clean_complete_path)
        df = _standardize_clean_complete(df)
        df = _apply_population(df, pop_map)
        df = _validate_and_clean(df)
        return df

    raise FileNotFoundError(
        "No supported dataset found. Provide one of: "
        "'Covid19 data/covid_data.csv', 'Covid19 data/full_grouped.csv', or 'Covid19 data/covid_19_clean_complete.csv'."
    )


def load_supporting_datasets() -> dict[str, pd.DataFrame]:
    data_dir = get_data_dir()
    datasets: dict[str, pd.DataFrame] = {}

    country_latest_path = data_dir / "country_wise_latest.csv"
    if country_latest_path.exists():
        df = pd.read_csv(country_latest_path)
        df = df.rename(
            columns={
                "Country/Region": "location",
                "Confirmed": "total_cases",
                "Deaths": "total_deaths",
                "Recovered": "total_recovered",
                "Active": "active",
                "New cases": "new_cases",
                "New deaths": "new_deaths",
                "New recovered": "new_recovered",
            }
        )
        for col in [
            "total_cases",
            "total_deaths",
            "total_recovered",
            "active",
            "new_cases",
            "new_deaths",
            "new_recovered",
        ]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        datasets["country_wise_latest"] = df

    day_wise_path = data_dir / "day_wise.csv"
    if day_wise_path.exists():
        df = pd.read_csv(day_wise_path)
        df = df.rename(
            columns={
                "Date": "date",
                "Confirmed": "confirmed",
                "Deaths": "deaths",
                "Recovered": "recovered",
                "Active": "active",
                "New cases": "new_cases",
                "New deaths": "new_deaths",
                "New recovered": "new_recovered",
            }
        )
        df["date"] = pd.to_datetime(df["date"], errors="coerce", utc=False, format="%Y-%m-%d")
        df = df.dropna(subset=["date"]).copy()
        for col in ["confirmed", "deaths", "recovered", "active", "new_cases", "new_deaths", "new_recovered"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        datasets["day_wise"] = df.sort_values("date").reset_index(drop=True)

    worldometer_path = data_dir / "worldometer_data.csv"
    if worldometer_path.exists():
        df = pd.read_csv(worldometer_path)
        df = df.rename(
            columns={
                "Country/Region": "location",
                "Population": "population",
                "TotalCases": "total_cases",
                "NewCases": "new_cases",
                "TotalDeaths": "total_deaths",
                "NewDeaths": "new_deaths",
                "TotalRecovered": "total_recovered",
                "NewRecovered": "new_recovered",
                "ActiveCases": "active",
                "TotalTests": "total_tests",
            }
        )
        for col in [
            "population",
            "total_cases",
            "new_cases",
            "total_deaths",
            "new_deaths",
            "total_recovered",
            "new_recovered",
            "active",
            "total_tests",
        ]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        datasets["worldometer"] = df

    usa_county_path = data_dir / "usa_county_wise.csv"
    if usa_county_path.exists():
        df = pd.read_csv(usa_county_path)
        df = df.rename(
            columns={
                "Province_State": "state",
                "Admin2": "county",
                "Date": "date",
                "Confirmed": "confirmed",
                "Deaths": "deaths",
            }
        )
        df["date"] = pd.to_datetime(df["date"], errors="coerce", utc=False, format="%m/%d/%y")
        df = df.dropna(subset=["date"]).copy()
        for col in ["confirmed", "deaths"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        datasets["usa_county_wise"] = df

    return datasets
