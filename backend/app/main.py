from fastapi import FastAPI

app = FastAPI(title = "Speaking Agent API")

@app.get("/")
def health_check():
    return {"status": "ok","app" : "Speaking Agent"}
    