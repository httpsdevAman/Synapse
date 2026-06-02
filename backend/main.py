from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.repo import router as repo_router
from api.routes.search import router as search_router
from api.routes.chat import router as chat_router

app = FastAPI(
    title="AI Semantic Code Search API",
    version="1.0.0",
    description="Backend API for semantic repository analysis and retrieval"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {
        "message": "AI Semantic Search Code API is running"
    }

# Register Routes
app.include_router(
    repo_router,
    prefix="/api/repo",
    tags=["Repository"]
)

app.include_router(
    search_router,
    prefix="/api/search",
    tags=["Search"]
)

app.include_router(
    chat_router,
    prefix='/api/chat',
    tags=["Chat"]
)

@app.get("/health")
async def health():
    return {
        "status": "Healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)