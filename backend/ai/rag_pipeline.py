from retrieval.faiss_store import FAISSStore
from core.ai import embedder
from ai.prompt_builder import build_chat_prompt
from ai.llm_client import generate_response, generate_stream


def retrieve_chunks(repo_id: str, question: str, top_k: int = 5) -> list:
    faiss_store = FAISSStore()

    # Load the index
    faiss_store.load(repo_id)

    # Embed the question
    question_embedding = embedder.embed_text(question)

    # Search
    results = faiss_store.search(question_embedding, top_k)

    return results

def generate_answer(question: str, chunks: list) -> str:
    # Ready the prompt
    prompt = build_chat_prompt(question, chunks)

    # Generate the response
    response = generate_response(prompt["full_prompt"])

    return response
    
def generate_answer_stream(question: str, chunks: list):
    # Ready the prompt
    prompt = build_chat_prompt(question, chunks)

    # Generate the response
    yield from generate_stream(prompt["full_prompt"])

def run_rag_pipeline(repo_id: str, question: str, top_k: int = 5) -> str:

    results = retrieve_chunks(repo_id, question, top_k)

    response = generate_answer(question, results)

    return {
        "results": results,
        "content": response
    }

def run_rag_pipeline_stream(repo_id: str, question: str, top_k: int = 5):

    chunks = retrieve_chunks(repo_id, question, top_k)

    yield from generate_answer_stream(question, chunks)
