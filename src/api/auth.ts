import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

export interface GithubUser {
  login: string
  avatar_url: string
  name?: string
  [key: string]: unknown
}

export interface GithubTokenResponse {
  /** GitHub 原生字段名 */
  access_token?: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope?: string
}

/**
 * 后端接口约定（需后端实现）：
 *
 *   POST {VITE_APP_API_BASE_URL}/auth/github/token
 *   Body: { "code": "<GitHub 回调授权码>" }
 *
 *   200: { "token": "<会话令牌>" }
 *
 * 由后端持有 Client Secret 完成 code -> access_token 的交换，
 * 并在后续接口（如 POST /strategy/create）中校验 Authorization: Bearer <token>。
 * 用户信息不经过后端，由前端直接调用 GitHub API 获取。
 */
export function exchangeGithubToken(
  code: string
): Promise<AxiosResponse<GithubTokenResponse>> {
  return request({
    url: 'auth/github/token',
    method: 'post',
    data: { code },
  })
}

/**
 * 直接从 GitHub API 获取当前用户信息（api.github.com 支持 CORS）
 */
export async function fetchGithubUser(accessToken: string): Promise<GithubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) {
    throw new Error(`获取 GitHub 用户信息失败 (${res.status})`)
  }
  return (await res.json()) as GithubUser
}
