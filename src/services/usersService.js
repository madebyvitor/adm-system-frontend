import api from './api'

const USERS_ENDPOINT = '/users'

export async function listUsers({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get(USERS_ENDPOINT, { params: { page, limit } })
  return data
}

export async function createUser(payload) {
  const { data } = await api.post(USERS_ENDPOINT, payload)
  return data
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`${USERS_ENDPOINT}/${id}`, payload)
  return data
}

export async function deleteUser(id) {
  const { data } = await api.delete(`${USERS_ENDPOINT}/${id}`)
  return data
}
