from pathlib import Path

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__",
    ".next",
    "venv"
}

SUPPORTED_EXTENSIONS = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascriptreact",
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".go": "go",
    ".rs": "rust",
    ".md": "markdown"
}

def walk_repository(clone_path: str):
    repository_files = []
    root_path = Path(clone_path)

    for file_path in root_path.rglob("*"):
        if file_path.is_dir():
            continue

        if any(ignore_dir in file_path.parts for ignore_dir in IGNORE_DIRS):
            continue

        extension = file_path.suffix.lower()

        if extension not in SUPPORTED_EXTENSIONS:
            continue

        try:
            content = file_path.read_text(
                encoding="utf-8",
                errors="ignore"
            )

            relative_path = file_path.relative_to(root_path)
            repository_files.append({
                "file_path": str(relative_path),
                "language": SUPPORTED_EXTENSIONS[extension],
                "content": content
            })
        except Exception as e:
            print(f"Failed to read {file_path}: {e}")

    return repository_files
