import textwrap

'''
    File: src/auth/jwt.py (lines 12-45) [function]
    ---
    <actual code content>
'''

def format_chunk(chunk: dict) -> str:
    formatted = f"""
    File: {chunk["file_path"]} (lines {chunk["start_line"]}-{chunk["end_line"]}) [{chunk["chunk_type"]}]
    ---
    {chunk["content"]}
    """

    return textwrap.dedent(formatted).strip()

def build_context_block(chunks: list) -> str:       # Inputs retrieved chunks
    context_string = ""

    for result in chunks:
        context_string += format_chunk(result['chunk']) + "\n\n---\n\n"

    return context_string

# Replace the single string with a cleaner multiline
def build_system_prompt() -> str:
    return "\n".join([
        "You are an expert code intelligence assistant.",
        "Answer only based on the provided repository context below.",
        "If the answer is not in the context, say so honestly.",
        "Always reference file paths when explaining code.",
        "Format code in markdown code blocks with the correct language tag.",
    ])

def build_chat_prompt(question: str, chunks: list) -> dict:
    system = build_system_prompt()
    context = build_context_block(chunks)
    full_prompt = system + "\n" + context + "\n" + question

    return {
        "system": system,
        "context": context,
        "user": question,
        "full_prompt": full_prompt
    }