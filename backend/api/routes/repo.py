from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.repo_service import (
    clone_repository,
    register_repository,
    get_all_repositories,
    get_repository
)
from services.indexing_service import index_repository

router = APIRouter()

class RepositoryRequest(BaseModel):
    github_url: str

@router.get("/")
async def list_repositories():
    try:
        return get_all_repositories()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list repositories: {str(e)}"
        )

@router.get("/{repo_id}")
async def get_repository_details(repo_id: str):
    repo = get_repository(repo_id)
    if not repo:
        raise HTTPException(
            status_code=404,
            detail="Repository not found"
        )
    return repo

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
        
        # Register in registry.json
        register_repository(
            repo_id=clone_res["repo_id"],
            repo_name=clone_res["repo_name"],
            github_url=github_url,
            total_files=index_res["total_files"],
            total_chunks=index_res["total_chunks"]
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