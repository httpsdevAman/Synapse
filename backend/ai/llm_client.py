from groq import Groq
from config import settings

# Initialize Groq client once at module level
client = Groq(api_key=settings.GROQ_API_KEY)

def check_groq_connection() -> bool:
    """Check if Groq API is reachable and API key is valid"""
    try:
        models = client.models.list()
        return True
    except Exception as e:
        print(f"Groq connection failed: {e}")
        return False

def get_available_models() -> list:
    """Return list of available Groq models"""
    try:
        models = client.models.list()
        return [model.id for model in models.data]
    except Exception as e:
        print(f"Failed to fetch models: {e}")
        return []

def generate_response(prompt: str) -> str:
    """Non-streaming — returns full response at once"""
    try:
        print(get_available_models())
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Groq generation failed: {e}")
        raise e

def generate_stream(prompt: str):
    """Streaming — yields tokens one by one as a generator"""
    try:
        stream = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2048,
            stream=True,
        )

        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token is not None:
                yield token

    except Exception as e:
        print(f"Groq streaming failed: {e}")
        raise e