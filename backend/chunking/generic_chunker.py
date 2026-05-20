from chunking.base_chunker import BaseChunker

class GenericChunker(BaseChunker):
    def __init__(self, chunk_size: int = 50, overlap: int = 10):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, file_dict: dict):
        chunks = []

        lines = file_dict["content"].splitlines()

        total_lines = len(lines)
        
        start = 0
        while(start < total_lines):
            end = min(start + self.chunk_size, total_lines)
            chunk_lines = lines[start: end]
            chunk_text = "\n".join(chunk_lines)

            chunks.append({
                "file_path": file_dict["file_path"],
                "language": file_dict["language"],
                "content": chunk_text,
                "start_line": start + 1,
                "end_line": end,
                "chunk_type": "block"
            })

            start += self.chunk_size - self.overlap

        return chunks