import api from './api'

const PRODUCTS_ENDPOINT = '/products'

export async function listProducts({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get(PRODUCTS_ENDPOINT, { params: { page, limit } })
  return data
}

export async function createProduct(payload) {
  const { data } = await api.post(PRODUCTS_ENDPOINT, payload)
  return data
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`${PRODUCTS_ENDPOINT}/${id}`, payload)
  return data
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`${PRODUCTS_ENDPOINT}/${id}`)
  return data
}
