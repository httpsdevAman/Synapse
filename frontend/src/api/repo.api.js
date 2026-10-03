import api from "./axios";

export const uploadRepository = async (github_url) => {
    const response = await api.post("/repo/upload", { github_url: github_url });
    return response.data;
}

export const fetchRepositories = async () => {
    const response = await api.get(`/repo?t=${Date.now()}`);
    return response.data;
}

export const fetchRepositoryById = async (repoId) => {
    const response = await api.get(`/repo/${repoId}?t=${Date.now()}`);
    return response.data;
}

export const searchRepository = async (repoId, query, topK = 5) => {
    const response = await api.post("/search", {
        repo_id: repoId,
        query: query,
        top_k: topK
    });
    return response.data;
}

export const chatRepository = async (repoId, question, topK = 5) => {
    const response = await api.post("/chat", {
        repo_id: repoId,
        question: question,
        top_k: topK
    });

    return response.data;
}