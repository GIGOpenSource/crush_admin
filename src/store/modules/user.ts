import { defineStore } from 'pinia';

export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface UserState {
  token: string;
  userInfo: UserInfo | null;
}

export const useUserStore = defineStore(
  'user',
  {
    state: (): UserState => ({
      token: '',
      userInfo: null,
    }),
    getters: {
      isLogin: (state) => !!state.token,
    },
    actions: {
      setToken(token: string) {
        this.token = token;
      },
      setUserInfo(userInfo: UserInfo) {
        this.userInfo = userInfo;
      },
      logout() {
        this.token = '';
        this.userInfo = null;
      },
    },
    persist: {
      key: 'user-store',
      paths: ['token', 'userInfo'],
    },
  },
);

