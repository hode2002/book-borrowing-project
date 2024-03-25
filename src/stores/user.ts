import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserProfile } from '@/interfaces'

type AccessToken = string | null

interface UserStore {
  accessToken: Ref<AccessToken>
  setToken: (token: AccessToken) => void
  getToken: () => AccessToken
  removeToken: () => void
  profile: Ref<UserProfile>
  setProfile: (profile: UserProfile) => void
  getProfile: () => UserProfile
}

interface UserData {
  accessToken: AccessToken
  profile: UserProfile | null
}

export const useUserStore = defineStore('user', () => {
  const accessToken = ref<AccessToken>('')
  const profile = ref<UserProfile | null>(null)

  const setToken = (token: AccessToken): void => {
    accessToken.value = token
    const user: UserData = {
      accessToken: accessToken.value,
      profile: profile.value
    }
    window.localStorage.setItem('user', JSON.stringify(user))
  }

  const getToken = (): AccessToken => {
    if (!accessToken.value) {
      const user = <UserData>JSON.parse(window.localStorage.getItem('user')!)
      accessToken.value = user?.accessToken
    }

    return accessToken.value
  }

  const removeToken = (): void => {
    accessToken.value = null
    profile.value = null
    window.localStorage.removeItem('user')
  }

  const setProfile = (userProfile: UserProfile): void => {
    profile.value = userProfile
    const user: UserData = {
      accessToken: accessToken.value,
      profile: profile.value
    }
    window.localStorage.setItem('user', JSON.stringify(user))
  }

  const getProfile = (): UserProfile | null => {
    if (!profile.value) {
      const user = <UserData>JSON.parse(window.localStorage.getItem('user')!)
      profile.value = user?.profile
    }
    return profile.value
  }

  return {
    accessToken,
    setToken,
    getToken,
    removeToken,
    profile,
    setProfile,
    getProfile
  } as UserStore
})
