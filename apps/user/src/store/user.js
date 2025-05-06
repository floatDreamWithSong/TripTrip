import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

const storage = {
  getItem: async (name) => {
    try {
      const value = Taro.getStorageSync(name)
      return value || null
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      Taro.setStorageSync(name, value)
    } catch {}
  },
  removeItem: async (name) => {
    try {
      Taro.removeStorageSync(name)
    } catch {}
  },
}

export const useUserStore = create()(
  persist(
    (set) => ({
      isLogin: false,
      userInfo: null,
      setUserInfo: (info) => set({ userInfo: info, isLogin: true }),
      clearUserInfo: () => set({ userInfo: null, isLogin: false }),
      logout: () => {
        set({ userInfo: null, isLogin: false })
        Taro.removeStorageSync('accessToken')
        Taro.removeStorageSync('refreshToken')
        Taro.navigateTo({ url: '/pages/login/index' })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => storage),
    }
  )
)
