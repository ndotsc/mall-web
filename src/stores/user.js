import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, me } from '@/api/auth'
import { setToken, clearToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // { id, username, nickname, ... }
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    displayName: (state) =>
      state.user?.nickname || state.user?.username || '',
  },
  actions: {
    set(u) {
      this.user = u
    },
    async login(username, password) {
      const data = await loginApi(username, password)
      setToken(data.token)
      this.user = data.user || (await me())
      return this.user
    },
    async register(username, password, nickname) {
      const data = await registerApi(username, password, nickname)
      setToken(data.token)
      this.user = data.user || (await me())
      return this.user
    },
    logout() {
      clearToken()
      this.user = null
    },
  },
})
