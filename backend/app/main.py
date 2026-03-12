from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import country_comparison, global_stats, heatmap, top_countries, trends
from app.services.data_loader import load_covid_dataset, load_supporting_datasets


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.covid_df = load_covid_dataset()
    app.state.datasets = load_supporting_datasets()
    yield


app = FastAPI(title="COVID-19 Data Analytics Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(global_stats.router)
app.include_router(trends.router)
app.include_router(country_comparison.router)
app.include_router(top_countries.router)
app.include_router(heatmap.router)
