from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ai_chat import router as ai_chat_router
from routes.forecast import router as forecast_router
import uvicorn

app = FastAPI(
    title="AI CFO Platform API",
    description="Backend API for AI CFO Platform - FTL Hackathon 2026",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ai_chat_router)
app.include_router(forecast_router)

@app.get("/")
def root():
    return {
        "message": "AI CFO Platform API is running!",
        "company": "Nexus TechServe Pvt Ltd",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)