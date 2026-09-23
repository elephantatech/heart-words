from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.web.routes import router as web_router
from app.words.load import load_catalog

STATIC_DIR = Path(__file__).resolve().parent / "static"


def create_app() -> FastAPI:
    application = FastAPI(title="Heart and Sight Words")
    application.state.catalog = load_catalog()
    application.include_router(api_router, prefix="/api")
    application.include_router(web_router)
    application.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    return application


app = create_app()
