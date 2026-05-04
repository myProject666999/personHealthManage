import request from '../utils/axios'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
}

export const userApi = {
  getProfile: () => request.get('/user/profile'),
  updateProfile: (data) => request.put('/user/profile', data),
  changePassword: (data) => request.put('/user/password', data),
}

export const healthApi = {
  getRecords: (params) => request.get('/user/health/records', { params }),
  getRecord: (id) => request.get(`/user/health/records/${id}`),
  createRecord: (data) => request.post('/user/health/records', data),
  updateRecord: (id, data) => request.put(`/user/health/records/${id}`, data),
  deleteRecord: (id) => request.delete(`/user/health/records/${id}`),
  getStats: () => request.get('/user/health/stats'),
  evaluate: (recordId) => request.get('/user/health/evaluation', { params: { record_id: recordId } }),
  getEvaluations: (params) => request.get('/user/health/evaluations', { params }),
}

export const sportApi = {
  getKnowledges: (params) => request.get('/user/sport/knowledges', { params }),
  getKnowledge: (id) => request.get(`/user/sport/knowledges/${id}`),
  getDetails: (knowledgeId) => request.get('/user/sport/details', { params: { knowledge_id: knowledgeId } }),
  getDetail: (id) => request.get(`/user/sport/details/${id}`),
}
