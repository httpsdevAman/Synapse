import ast

from chunking.generic_chunker import GenericChunker
from chunking.base_chunker import BaseChunker

class PythonChunker(BaseChunker):
    def __init__(self):
        self.generic_chunker = GenericChunker()

    def chunk(self, file_dict):
        content = file_dict["content"]

        try:
            tree = ast.parse(content)
            chunks = []
            lines = content.splitlines()

            for node in ast.walk(tree):
                # Functions
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    start_line = node.lineno
                    end_line = node.end_lineno

                    chunk_content = "\n".join(lines[start_line - 1: end_line+1])

                    chunks.append({
                        "file_path": file_dict["file_path"],
                        "language": file_dict["language"],
                        "content": chunk_content,
                        "start_line": start_line,
                        "end_line": end_line,
                        "chunk_type": "function"
                    })
                # Classes
                elif isinstance(node, ast.ClassDef):

                    start_line = node.lineno
                    end_line = node.end_lineno

                    chunk_content = "\n".join(
                        lines[start_line - 1:end_line]
                    )

                    chunks.append({
                        "file_path": file_dict["file_path"],
                        "language": file_dict["language"],
                        "content": chunk_content,
                        "start_line": start_line,
                        "end_line": end_line,
                        "chunk_type": "class"
                    })

            return chunks
        
        except Exception as e:
            print(f"Python AST parsing failed: {e}")

            # Fallback to generic chunking
            return self.generic_chunker.chunk(file_dict)