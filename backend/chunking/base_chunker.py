from abc import ABC, abstractmethod


class BaseChunker(ABC):
    
    @abstractmethod
    def chunk(self, file_dict: dict):
        """
        Convert a file into semantic chunks
        """
        pass