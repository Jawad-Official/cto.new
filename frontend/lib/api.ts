import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/me'),
};

export const workspacesApi = {
  getAll: () => api.get('/workspaces'),
  getOne: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: any) => api.post('/workspaces', data),
  update: (id: string, data: any) => api.patch(`/workspaces/${id}`, data),
  addMember: (id: string, data: any) => api.post(`/workspaces/${id}/members`, data),
};

export const projectsApi = {
  getAll: (workspaceId: string) => api.get(`/projects?workspaceId=${workspaceId}`),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const issuesApi = {
  getAll: (params: any) => api.get('/issues', { params }),
  getOne: (id: string) => api.get(`/issues/${id}`),
  create: (data: any) => api.post('/issues', data),
  update: (id: string, data: any) => api.patch(`/issues/${id}`, data),
  delete: (id: string) => api.delete(`/issues/${id}`),
  addComment: (id: string, content: string) =>
    api.post(`/issues/${id}/comments`, { content }),
  addLabel: (id: string, labelId: string) =>
    api.post(`/issues/${id}/labels/${labelId}`),
};

export const aiApi = {
  generateIssue: (title: string, workspaceId: string) =>
    api.post('/ai/generate-issue', { title, workspaceId }),
  categorize: (title: string, description: string, workspaceId: string) =>
    api.post('/ai/categorize', { title, description, workspaceId }),
  detectDuplicates: (title: string, description: string, projectId: string) =>
    api.post('/ai/detect-duplicates', { title, description, projectId }),
};

export const searchApi = {
  search: (query: string, workspaceId: string) =>
    api.get(`/search?q=${query}&workspaceId=${workspaceId}`),
  semanticSearch: (query: string, projectId: string) =>
    api.get(`/search/semantic?q=${query}&projectId=${projectId}`),
  parseNaturalLanguage: (query: string, workspaceId: string) =>
    api.get(`/search/natural-language?q=${query}&workspaceId=${workspaceId}`),
};

export const storageApi = {
  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const params = folder ? { folder } : {};
    return api.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params,
    });
  },
  deleteFile: (key: string) => api.post('/storage/delete', { key }),
  getSignedUrl: (key: string, expiresIn?: number) =>
    api.get('/storage/signed-url', { params: { key, expiresIn } }),
  getFileMetadata: (key: string) => api.get(`/storage/metadata/${key}`),
};

export const attachmentsApi = {
  uploadToIssue: (issueId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/issues/${issueId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFromIssue: (issueId: string, attachmentId: string) =>
    api.delete(`/issues/${issueId}/attachments/${attachmentId}`),
};
