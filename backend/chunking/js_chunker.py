from tree_sitter import Language, Parser

from chunking.base_chunker import BaseChunker
from chunking.generic_chunker import GenericChunker


# Build languages first
import os
SO_PATH = "build/my_languages.so"
os.makedirs(os.path.dirname(SO_PATH), exist_ok=True)
if not os.path.exists(SO_PATH):
    Language.build_library(
        SO_PATH,
        [
            "vendor/tree-sitter-javascript",
            "vendor/tree-sitter-typescript/typescript",
        ]
    )


JS_LANGUAGE = Language(
    "build/my_languages.so",
    "javascript"
)

TS_LANGUAGE = Language(
    "build/my_languages.so",
    "typescript"
)


class JSChunker(BaseChunker):

    def __init__(self):

        self.generic_chunker = GenericChunker()

        self.parser = Parser()

    def chunk(self, file_dict: dict):

        try:

            language = file_dict["language"]

            if language in ["javascript", "javascriptreact"]:
                self.parser.set_language(JS_LANGUAGE)

            elif language in ["typescript", "typescriptreact"]:
                self.parser.set_language(TS_LANGUAGE)

            else:
                return self.generic_chunker.chunk(file_dict)

            content = file_dict["content"]

            tree = self.parser.parse(
                bytes(content, "utf-8")
            )

            root_node = tree.root_node

            lines = content.splitlines()

            chunks = []

            target_node_types = {
                "function_declaration",
                "method_definition",
                "class_declaration",
                "arrow_function",
                "function"
            }

            def traverse(node):

                if node.type in target_node_types:

                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1

                    chunk_content = "\n".join(
                        lines[start_line - 1:end_line]
                    )

                    chunk_type = (
                        "class"
                        if "class" in node.type
                        else "function"
                    )

                    chunks.append({
                        "file_path": file_dict["file_path"],
                        "language": language,
                        "content": chunk_content,
                        "start_line": start_line,
                        "end_line": end_line,
                        "chunk_type": chunk_type
                    })

                for child in node.children:
                    traverse(child)

            traverse(root_node)

            # fallback if no chunks extracted
            if not chunks:
                return self.generic_chunker.chunk(file_dict)

            return chunks

        except Exception as e:

            print(f"JS chunking failed: {e}")

            return self.generic_chunker.chunk(file_dict)