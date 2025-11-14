from fastapi import FastAPI
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env: str = "development"
    feature_demo: bool = False

settings = Settings()
app = FastAPI(title="Example API")

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/readyz")
def readyz():
    return {"ready": True, "env": settings.env}
