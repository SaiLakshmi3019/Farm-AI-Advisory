from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from detection import router as detection_router

app = FastAPI(
    title="Farm AI Advisory System",
    description="AI-powered crop disease detection and agricultural advisory system",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(detection_router)


@app.get("/")
def root():
    return {
        "message": "Farm AI Advisory System is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }