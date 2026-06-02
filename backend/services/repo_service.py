from pathlib import Path
from uuid import uuid4
import shutil
import json
from git import Repo
from config import settings

REGISTRY_FILE = Path(settings.REPOS_DIR) / "registry.json"

def get_registry():
    if not REGISTRY_FILE.exists():
        return {}
    try:
        with open(REGISTRY_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def save_registry(registry):
    with open(REGISTRY_FILE, "w") as f:
        json.dump(registry, f, indent=4)

def register_repository(repo_id: str, repo_name: str, github_url: str, total_files: int = 0, total_chunks: int = 0):
    registry = get_registry()
    registry[repo_id] = {
        "repo_id": repo_id,
        "repo_name": repo_name,
        "github_url": github_url,
        "total_files": total_files,
        "total_chunks": total_chunks,
        "status": "Indexed"
    }
    save_registry(registry)

def get_all_repositories():
    registry = get_registry()
    return list(registry.values())

def get_repository(repo_id: str):
    registry = get_registry()
    return registry.get(repo_id)


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

    # Remove from registry
    registry = get_registry()
    if repo_id in registry:
        del registry[repo_id]
        save_registry(registry)

    return {
        "repo_id": repo_id,
        "status": "Repository Deleted Successfully"
    }