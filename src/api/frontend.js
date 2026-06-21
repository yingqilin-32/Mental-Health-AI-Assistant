import apiClient from "../utils/requires";


export const register = (data) => {
    return apiClient.post('/user/add', data);
}

export const startSession = (data) => {
    return apiClient.post('/psychological-chat/session/start', data);
}

export const getSessionList = (params) => {
    return apiClient.get('/psychological-chat/sessions', { params });
}

export const deleteSession = (sessionId) => {
    return apiClient.delete(`/psychological-chat/sessions/${sessionId}`);
}

export const getSessionDetail = (sessionId) => {
    return apiClient.get(`/psychological-chat/sessions/${sessionId}/messages`);
}

export const addEmotionDiary = (data) => {
    return apiClient.post('/emotion-diary', data);
}