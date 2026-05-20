from pathlib import Path
from uuid import uuid4
import shutil
from git import Repo
from config import settings

def clone_repository(github_url: str):
    # Extract the repo name
    repo_name = github_url.rstrip("/").split("/")[-1]

    # Generate a Repo ID
    repo_id = str(uuid4())

    # Clone Dir Path
    clone_path = Path(settings.REPOS_DIR) / repo_id

    Repo.clone_from(github_url, clone_path)

    return {
        "repo_id": repo_id,
        "repo_name": repo_name,
        "clone_path": str(clone_path),
        "status": "Repository Cloned Successfully"
    }

def delete_repository(repo_id: str):
    repo_path = Path(settings.REPOS_DIR) / repo_id

    if repo_path.exists():
        shutil.rmtree(repo_path)

    return {
        "repo_id": repo_id,
        "status": "Repository Deleted Successfully"
    }