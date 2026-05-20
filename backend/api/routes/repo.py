from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.repo_service import clone_repository
from services.indexing_service import index_repository

router = APIRouter()

class RepositoryRequest(BaseModel):
    github_url: str

@router.get("/")
async def repo_home():
    return {
        "message": "Repository routes working"
    }

@router.post("/upload")
async def upload_repository(payload: RepositoryRequest):
    github_url = payload.github_url

    try:
        # Clone Repo
        clone_res = clone_repository(github_url)
        
        # Index Repo
        index_res = index_repository(
            repo_id=clone_res["repo_id"],
            clone_path=clone_res["clone_path"]
        )
        
        return {
            "repository": clone_res,
            "indexing": index_res
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Repository processing failed: {str(e)}"
        )