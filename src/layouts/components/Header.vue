<template>
  <a-layout-header class="layout-header">
    <div class="header-left">
      <menu-unfold-outlined
        v-if="settingStore.collapsed"
        class="trigger"
        @click="settingStore.toggleCollapsed()"
      />
      <menu-fold-outlined v-else class="trigger" @click="settingStore.toggleCollapsed()" />
    </div>
    <div class="header-right">
      <a-dropdown>
        <a class="ant-dropdown-link" @click.prevent>
          <a-avatar :size="32" style="background-color: #1890ff">
            {{ userStore.userInfo?.name?.[0] || 'U' }}
          </a-avatar>
          <span style="margin-left: 8px">{{ userStore.userInfo?.name || '用户' }}</span>
          <DownOutlined />
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile">
              <UserOutlined />
              个人中心
            </a-menu-item>
            <a-menu-item key="settings">
              <SettingOutlined />
              设置
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined />
              退出登录
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useSettingStore, useUserStore } from '@/store';

const router = useRouter();
const settingStore = useSettingStore();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style lang="less" scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;

    .trigger {
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .ant-dropdown-link {
      display: flex;
      align-items: center;
      color: #000;
      cursor: pointer;
    }
  }
}
</style>

