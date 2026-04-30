import api from './axios'

export const meetingAPI = {
  create:    (data)    => api.post('/meetings', data),
  getHistory:()        => api.get('/meetings/history'),
  getByRoom: (roomId)  => api.get(`/meetings/${roomId}`),
  end:       (roomId)  => api.post(`/meetings/${roomId}/end`),
  summarize: (data)    => api.post('/meetings/summarize', data),
}

export const notificationAPI = {
  getAll:      (page = 1) => api.get(`/notifications?page=${page}`),
  markRead:    (id)       => api.put(`/notifications/${id}/read`),
  markAllRead: ()         => api.put('/notifications/read-all'),
  delete:      (id)       => api.delete(`/notifications/${id}`),
}