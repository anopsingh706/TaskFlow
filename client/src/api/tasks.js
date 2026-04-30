import api from './axios'

export const taskAPI = {
  getAll:     (params = {}) => api.get('/tasks', { params }),
  getAssigned: ()           => api.get('/tasks/assigned'),
  getById:    (id)          => api.get(`/tasks/${id}`),
  create:     (data)        => api.post('/tasks', data),
  update:     (id, data)    => api.put(`/tasks/${id}`, data),
  reorder:    (updates)     => api.patch('/tasks/reorder', { updates }),
  delete:     (id)          => api.delete(`/tasks/${id}`),
  addComment: (id, content) => api.post(`/tasks/${id}/comments`, { content }),
}

export const aiAPI = {
  suggestPriority: (title, description) =>
    api.post('/ai/suggest-priority', { title, description }),
  summarizeChat: (messages) =>
    api.post('/ai/summarize-chat', { messages }),
}