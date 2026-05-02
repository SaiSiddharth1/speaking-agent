from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Speaking Agent API")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"status": "Speaking Agent API running"}