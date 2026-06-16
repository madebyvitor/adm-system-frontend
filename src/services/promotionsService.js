import api from './api'
import { toApiDateTime } from '../utils/promotionHelpers'

const PROMOTIONS_ENDPOINT = '/promotions'

export function buildPromotionPayload(form, productIds, { includeProducts = true } = {}) {
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    discount_type: 'percentage',
    discount_value: Number(form.discount_percentage),
    start_date: toApiDateTime(form.start_date),
    end_date: toApiDateTime(form.end_date, true),
  }

  if (includeProducts) {
    payload.product_ids = productIds
  }

  return payload
}

export async function listPromotions({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get(PROMOTIONS_ENDPOINT, { params: { page, limit } })
  return data
}

export async function getPromotion(id) {
  const { data } = await api.get(`${PROMOTIONS_ENDPOINT}/${id}`)
  return data
}

export async function createPromotion(payload) {
  const { data } = await api.post(PROMOTIONS_ENDPOINT, payload)
  return data
}

export async function updatePromotion(id, payload) {
  const { data } = await api.put(`${PROMOTIONS_ENDPOINT}/${id}`, payload)
  return data
}

export async function deletePromotion(id) {
  const { data } = await api.delete(`${PROMOTIONS_ENDPOINT}/${id}`)
  return data
}

export async function linkPromotionProducts(promotionId, productIds) {
  const { data } = await api.post(`${PROMOTIONS_ENDPOINT}/${promotionId}/products`, {
    product_ids: productIds,
  })
  return data
}

export async function unlinkPromotionProduct(promotionId, productId) {
  const { data } = await api.delete(
    `${PROMOTIONS_ENDPOINT}/${promotionId}/products/${productId}`,
  )
  return data
}
