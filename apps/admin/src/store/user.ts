import { UserInfo } from '@triptrip/utils'
import { create } from 'zustand'


interface UserState {
  userInfo: UserInfo | null
  setUserInfo: (info: UserInfo | null) => void
  clearUserInfo: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
  clearUserInfo: () => set({ userInfo: null })
}))
