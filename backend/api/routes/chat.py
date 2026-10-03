from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.rag_pipeline import run_rag_pipeline, run_rag_pipeline_stream
from fastapi.responses import StreamingResponse

router = APIRouter()

class GenerationRequest(BaseModel):
    question: str
    repo_id: str
    top_k: int = 5

@router.post("")
async def chat_response(payload: GenerationRequest):
    try:
        response = run_rag_pipeline(payload.repo_id, payload.question, payload.top_k)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )
    
@router.post("/stream")
async def chat_stream(payload: GenerationRequest):
    try:
        async def stream_generator():
            for token in run_rag_pipeline_stream(
                payload.repo_id,
                payload.question,
                payload.top_k
            ):
                yield token

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate stream: {str(e)}"
        )