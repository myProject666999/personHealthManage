import request from '../utils/axios'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
}

export const userApi = {
  getUsers: (params) => request.get('/admin/users', { params }),
  getUser: (id) => request.get(`/admin/users/${id}`),
  createUser: (data) => request.post('/admin/users', data),
  updateUser: (id, data) => request.put(`/admin/users/${id}`, data),
  deleteUser: (id) => request.delete(`/admin/users/${id}`),
}

export const roleApi = {
  getRoles: () => request.get('/admin/roles'),
  getRole: (id) => request.get(`/admin/roles/${id}`),
  createRole: (data) => request.post('/admin/roles', data),
  updateRole: (id, data) => request.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => request.delete(`/admin/roles/${id}`),
}

export const sportApi = {
  getKnowledges: (params) => request.get('/admin/sport/knowledges', { params }),
  getKnowledge: (id) => request.get(`/admin/sport/knowledges/${id}`),
  createKnowledge: (data) => request.post('/admin/sport/knowledges', data),
  updateKnowledge: (id, data) => request.put(`/admin/sport/knowledges/${id}`, data),
  deleteKnowledge: (id) => request.delete(`/admin/sport/knowledges/${id}`),

  getDetails: (knowledgeId) => request.get('/admin/sport/details', { params: { knowledge_id: knowledgeId } }),
  getDetail: (id) => request.get(`/admin/sport/details/${id}`),
  createDetail: (data) => request.post('/admin/sport/details', data),
  updateDetail: (id, data) => request.put(`/admin/sport/details/${id}`, data),
  deleteDetail: (id) => request.delete(`/admin/sport/details/${id}`),
}

export const healthApi = {
  getRecords: (params) => request.get('/admin/health/records', { params }),
  getRecord: (id) => request.get(`/admin/health/records/${id}`),
  deleteRecord: (id) => request.delete(`/admin/health/records/${id}`),
  getEvaluations: (params) => request.get('/admin/health/evaluations', { params }),
}
