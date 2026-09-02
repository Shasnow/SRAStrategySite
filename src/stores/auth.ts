import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { exchangeGithubToken, fetchGithubUser } from '@/api/auth'
import type { GithubUser } from '@/api/auth'
import {
  clearSession,
  consumeOAuthState,
  getToken,
  getUser,
  saveOAuthState,
  saveSession,
} from '@/utils/authStorage'

const CLIENT_ID = import.meta.env.VITE_APP_GITHUB_CLIENT_ID

const OAUTH_ERROR_TEXT: Record<string, string> = {
  access_denied: '您取消了 GitHub 授权',
  redirect_uri_mismatch: '回调地址未在 GitHub 应用中登记',
  application_suspended: 'GitHub 应用已被暂停',
}

export interface OAuthCallbackResult {
  ok: boolean
  message?: string
}

/** 生成 URL-safe 的随机 state（CSRF 防护） */
function createOAuthState(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** 回调地址 = 当前站点根路径（需在 GitHub OAuth 应用中登记） */
function buildRedirectUri(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString()
}

function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: buildRedirectUri(),
    scope: 'read:user user:email',
    state,
    allow_signup: 'true',
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

/** 移除地址栏中的 code/state 等敏感参数 */
function cleanCallbackUrl(): void {
  const url = new URL(window.location.href)
  if (url.search) {
    url.search = ''
    window.history.replaceState(window.history.state, '', url.toString())
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const user = ref<GithubUser | null>(getUser())
  const authLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  /** 跳转到 GitHub 授权页面 */
  function login(): void {
    if (!CLIENT_ID) {
      ElMessage.error('未配置 GitHub Client ID，无法登录')
      return
    }
    const state = createOAuthState()
    saveOAuthState({ state, createdAt: Date.now() })
    window.location.assign(buildAuthorizeUrl(state))
  }

  /**
   * 处理 GitHub 授权回调（App 挂载时调用）：
   * 校验 state -> 交由后端换取令牌 -> 从 GitHub 获取用户信息 -> 保存会话
   */
  async function handleOAuthCallback(): Promise<OAuthCallbackResult> {
    const query = new URLSearchParams(window.location.search)
    const code = query.get('code')
    const state = query.get('state')
    const error = query.get('error')

    cleanCallbackUrl()

    if (error) {
      const description = query.get('error_description')
      return {
        ok: false,
        message: description || OAUTH_ERROR_TEXT[error] || 'GitHub 授权失败',
      }
    }
    if (!code || !state) {
      return { ok: false, message: '授权回调参数缺失' }
    }
    if (!consumeOAuthState(state)) {
      return { ok: false, message: 'state 校验失败，会话可能已过期，请重新登录' }
    }

    authLoading.value = true
    try {
      const { data } = await exchangeGithubToken(code)
      const accessToken = data.access_token
      if (!accessToken) {
        return { ok: false, message: '登录服务未返回访问令牌' }
      }
      let userInfo: GithubUser | null = null
      try {
        userInfo = await fetchGithubUser(accessToken)
      } catch (err) {
        console.error('Failed to fetch GitHub user info:', err)
        return { ok: false, message: '获取用户信息失败，请稍后重试' }
      }
      saveSession(accessToken, userInfo)
      token.value = accessToken
      user.value = userInfo
      return { ok: true }
    } catch (err) {
      console.error('GitHub OAuth token exchange failed:', err)
      return { ok: false, message: '登录失败，请稍后重试' }
    } finally {
      authLoading.value = false
    }
  }

  /** 登出：清除本地会话 */
  function logout(): void {
    clearSession()
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    authLoading,
    isAuthenticated,
    login,
    logout,
    handleOAuthCallback,
  }
})
