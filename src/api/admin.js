import apiClient from "../utils/requires";


export const login = (data) => {
    return apiClient.post('/user/login', data);
}


export const categoryList = () => {
    return apiClient.get('/knowledge/category/tree');
}

export const articleList = (params) => {
    return apiClient.get('/knowledge/article/page', { params });
}

export const uploadFile = (file, businessInfo) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessType', 'ARTICLE');
    formData.append('businessId', businessInfo.businessId);
    formData.append('businessField','COVER');

    return apiClient.post('/file/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
            // file+data, need to set content type to multipart/form-data, otherwise the backend will not be able to parse the file
        }
    });
}

export const createArticle = (data) => {
    return apiClient.post('/knowledge/article', data);
}

export const getArticleDetail = (id) => {
    return apiClient.get(`/knowledge/article/${id}`);
}

export const updateArticle = (id, data) => {
    return apiClient.put(`/knowledge/article/${id}`, data);
}

export const changeArticleStatus = (id, status) => {
    return apiClient.put(`/knowledge/article/${id}/status`, { status: String(status) });
}

export const deleteArticle = (id) => {
    return apiClient.delete(`/knowledge/article/${id}`);
}

export const consultationList = (params) => {
    return apiClient.get('/psychological-chat/sessions', { params });
}

export const sessionList=(sessionId) =>{
    return apiClient.get(`/psychological-chat/sessions/${sessionId}/messages`);
}

export const emotionList = (params) => {
    return apiClient.get('/emotion-diary/admin/page', { params });
}

export const deleteEmotionEntry = (id) => {
    return apiClient.delete(`/emotion-diary/admin/${id}`);
}

export const getAnalyticsOverview = () => {
    return apiClient.get('/data-analytics/overview');
}

export const logout = () => {
    return apiClient.post('/user/logout');
}