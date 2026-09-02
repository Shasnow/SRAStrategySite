import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

export interface StrategyMeta {
  id: number | string
  title: string
  description: string
  updateTime?: number
  uploader: string
  isPublic: boolean
}

export interface StrategyDetail {
  id: number | string | null
  title: string
  description: string
  author: string
  uploader: string
  share_code: string
  min_coins: number
  min_level: number
  mid_level: number
  on_field: string
  off_field: string
  [key: string]: unknown
}

export interface PageResult<T> {
  records: T[]
  total: number
}

export function getStrategies(): Promise<AxiosResponse<StrategyMeta[]>> {
  return request({
    url: '/strategy',
    method: 'get',
  })
}

export function getStrategiesByUploader(params: {
  uploader: string
  page: number
  pageSize: number
}): Promise<AxiosResponse<PageResult<StrategyMeta>>> {
  return request({
    url: '/strategy/by-uploader',
    method: 'get',
    params,
  })
}

export function getStrategyDetail(
  id: number | string
): Promise<AxiosResponse<StrategyDetail>> {
  return request({
    url: `/strategy/${id}`,
    method: 'get',
  })
}

export function createStrategy(
  data: Record<string, unknown>
): Promise<AxiosResponse> {
  return request({
    url: '/strategy',
    data,
    method: 'post',
  })
}
