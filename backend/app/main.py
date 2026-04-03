from fastapi import FastAPI

from app.database import Base, engine
from app import models  # noqa: F401
from app.routes.webhook import router as webhook_router

app = FastAPI(title="SaaS Backend API")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


app.include_router(webhook_router)
