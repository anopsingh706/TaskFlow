import api from './axios'

export const channelAPI = {
  getAll:       ()           => api.get('/channels'),
  create:       (data)       => api.post('/channels', data),
  getDM:        (userId)     => api.post('/channels/dm', { userId }),
  getById:      (id)         => api.get(`/channels/${id}`),
  update:       (id, data)   => api.put(`/channels/${id}`, data),
  addMember:    (id, userId) => api.post(`/channels/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/channels/${id}/members/${userId}`),
}

export const messageAPI = {
  getMessages:  (channelId, page = 1) => api.get(`/messages/${channelId}?page=${page}&limit=50`),
  editMessage:  (id, content)         => api.put(`/messages/${id}`, { content }),
  deleteMessage:(id)                   => api.delete(`/messages/${id}`),
  reactToMessage:(id, emoji)           => api.post(`/messages/${id}/react`, { emoji }),
  markRead:     (id)                   => api.post(`/messages/${id}/read`),
  search:       (q, channelId)         => api.get(`/messages/search?q=${encodeURIComponent(q)}${channelId ? `&channelId=${channelId}` : ''}`),
}