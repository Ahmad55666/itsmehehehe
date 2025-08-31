import numpy as np
from typing import List, Dict, Optional
from utils.singleton import Singleton

class SimpleVectorStore(metaclass=Singleton):
    def __init__(self):
        self.vectors = {}
        self.texts = {}

    def get_embedding(self, text: str) -> np.ndarray:
        # In a real application, you would use a pre-trained model like Sentence-BERT
        # For this demo, we'll use a simple average of word embeddings
        words = text.lower().split()
        if not words:
            return np.zeros(100)
        
        # Create a dummy embedding for each word
        embeddings = [np.random.rand(100) for _ in words]
        return np.mean(embeddings, axis=0)

    def add_conversation(self, tenant_id: str, conversation: List[Dict]):
        if tenant_id not in self.vectors:
            self.vectors[tenant_id] = []
            self.texts[tenant_id] = []

        for message in conversation:
            text = f"{message['sender']}: {message['text']}"
            vector = self.get_embedding(text)
            self.vectors[tenant_id].append(vector)
            self.texts[tenant_id].append(text)

    def find_similar_conversations(self, tenant_id: str, query: str, top_k: int = 3) -> List[str]:
        if tenant_id not in self.vectors:
            return []

        query_vector = self.get_embedding(query)
        
        # Calculate cosine similarity
        similarities = []
        for i, vector in enumerate(self.vectors[tenant_id]):
            similarity = np.dot(query_vector, vector) / (np.linalg.norm(query_vector) * np.linalg.norm(vector))
            similarities.append((similarity, i))

        # Sort by similarity and get the top-k results
        similarities.sort(key=lambda x: x[0], reverse=True)
        top_indices = [i for _, i in similarities[:top_k]]
        
        return [self.texts[tenant_id][i] for i in top_indices]

# Create a global instance of the vector store
vector_store = SimpleVectorStore()
