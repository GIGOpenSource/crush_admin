import { defineStore } from 'pinia';

interface SettingState {
  collapsed: boolean;
  theme: 'light' | 'dark';
}

export const useSettingStore = defineStore(
  'setting',
  {
    state: (): SettingState => ({
      collapsed: false,
      theme: 'light',
    }),
    getters: {
      siderWidth: (state) => (state.collapsed ? 80 : 200),
    },
    actions: {
      toggleCollapsed() {
        this.collapsed = !this.collapsed;
      },
      setCollapsed(collapsed: boolean) {
        this.collapsed = collapsed;
      },
      setTheme(theme: 'light' | 'dark') {
        this.theme = theme;
      },
    },
    persist: {
      key: 'setting-store',
      paths: ['collapsed', 'theme'],
    },
  },
);

