import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from config import settings

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

@app.get("/api")
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

@app.get("/api/health")
async def health():
    return {
        "status": "Healthy"
    }

# Serve frontend static files in production
if settings.ENVIRONMENT == "production":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dist = os.path.join(current_dir, "..", "frontend", "dist")
    
    if os.path.isdir(frontend_dist):
        assets_dir = os.path.join(frontend_dist, "assets")
        if os.path.isdir(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            path_to_file = os.path.join(frontend_dist, full_path)
            if os.path.isfile(path_to_file):
                return FileResponse(path_to_file)
            index_file = os.path.join(frontend_dist, "index.html")
            if os.path.isfile(index_file):
                return FileResponse(index_file)
            return {"error": "Frontend build not found"}
    else:
        @app.get("/{full_path:path}")
        async def frontend_not_built(full_path: str):
            return {"error": "Frontend build directory not found. Please run 'npm run build' in frontend."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)