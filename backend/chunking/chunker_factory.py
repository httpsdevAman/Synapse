from chunking.python_chunker import PythonChunker
from chunking.js_chunker import JSChunker
from chunking.generic_chunker import GenericChunker

def get_chunker(language: str):
    if(language == "python"):
        return PythonChunker()
    
    elif language in {
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    }:
        return JSChunker()

    return GenericChunker()