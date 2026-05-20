from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from embeddings.embedder import Embedder
from retrieval.faiss_store import FAISSStore
from core.ai import embedder

router = APIRouter()
# embedder = Embedder()
faiss_store = FAISSStore()

class SearchRequest(BaseModel):
    query: str
    repo_id: str
    top_k: int = 5

@router.post("/")
async def semantic_search(payload: SearchRequest):
    try:
        # Load vector store
        faiss_store.load(payload.repo_id)

        # Embed query
        query_embedding = embedder.embed_text(payload.query)

        # Search
        results = faiss_store.search(query_embedding, payload.top_k)

        return {
            "repo_id": payload.repo_id,
            "query": payload.query,
            "total_results": len(results),
            "results": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )