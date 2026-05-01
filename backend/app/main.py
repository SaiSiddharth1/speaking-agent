from fastapi import FastAPI
from database.connection import Base, engine
from app.routers import auth

# Create tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Speaking Agent API")

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "Speaking Agent API is running"}